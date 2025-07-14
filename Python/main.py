import openai
import os
import requests
from fastapi import FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from transformers import BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel
import io
import json
import torch
from ultralytics import YOLO
import cv2
import mimetypes
import re
import numpy as np
import tempfile
from skimage.metrics import structural_similarity as compare_ssim  # Added for SSIM comparison
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI()

load_dotenv()

# Set up OpenAI API key (securely via environment variables)
openai.api_key = os.getenv('OPENAI_API_KEY')

# Load BLIP, CLIP, and YOLO models
def load_models():
    blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir="./models/blip")
    blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir="./models/blip")

    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", cache_dir="./models/clip")
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", cache_dir="./models/clip")

    object_model = YOLO("yolov8l-oiv7.pt")
    logo_model = YOLO("best.pt")

    return blip_processor, blip_model, clip_processor, clip_model, object_model, logo_model

blip_processor, blip_model, clip_processor, clip_model, object_model, logo_model = load_models()

# Function to generate BLIP caption
def generate_blip_caption(image):
    inputs = blip_processor(images=image, return_tensors="pt")
    out = blip_model.generate(**inputs, max_length=150, num_beams=5, early_stopping=True)
    return blip_processor.decode(out[0], skip_special_tokens=True)

def detect_objects_with_yolo(image, model, confidence_threshold=0.8):

    results = model(image)
    detected_items = []
    for result in results:
        if not hasattr(result, 'boxes') or len(result.boxes) == 0:
            continue
        for det in result.boxes:
            if isinstance(det.cls, torch.Tensor) and det.cls.dim() == 0:
                continue
            label = det.cls.item() if isinstance(det.cls, torch.Tensor) else int(det.cls)
            confidence = det.conf.item() if isinstance(det.conf, torch.Tensor) else det.conf
            # Apply the confidence threshold
            if confidence > confidence_threshold:
                detected_items.append(model.names[int(label)])
    return detected_items

def clean_identified_brands(brands):
    # Remove invalid or extraneous brand-related responses
    valid_brands = []
    for brand in brands:
        brand = brand.strip().capitalize()  # Basic cleaning and capitalization
        brand = re.sub(r'\blogo\b', '', brand, flags=re.IGNORECASE).strip()  # Remove 'logo' word
        if not brand or "known brand names" in brand.lower() or "no well" in brand.lower():
            continue  # Skip invalid or irrelevant entries
        valid_brands.append(brand)

    # Ensure 'None' is not included in the final list
    valid_brands = [brand for brand in valid_brands if brand.lower() != "none"]

    return list(set(valid_brands))

async def detect_famous_brands_from_description(description):
    prompt = (
        f"Identify any famous or well-known brand names in the following description: '{description}'. "
        "Only return the brand names themselves, without additional descriptors or words (e.g., if 'Pran logo' appears, return 'Pran'). "
        "Provide a comma-separated list of well-known brands if present, or 'None' if no brands are detected."
    )
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50,
        temperature=0.5
    )
    brands = response['choices'][0]['message']['content']
    brands = re.split(r'[,\n;|-]', brands)
    brands = [brand.strip() for brand in brands if brand.strip().lower() != 'none']  # Remove 'None'
    return clean_identified_brands(brands)

def detect_objects_with_clip(image, text_prompts):
    inputs = clip_processor(text=text_prompts, images=image, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        image_features = clip_model.get_image_features(inputs['pixel_values'])
        text_features = clip_model.get_text_features(inputs['input_ids'])
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    similarity = (image_features @ text_features.T).squeeze()
    if similarity.dim() == 0:
        similarity = similarity.unsqueeze(0)
    detected_objects = []
    detected_brands = []
    for idx, score in enumerate(similarity):
        if score > 0.20:  # Lowered threshold to increase sensitivity for brand detection
            detected_item = (text_prompts[idx], float(score.item() if isinstance(score, torch.Tensor) else score))
            if "logo" in text_prompts[idx].lower() or "brand" in text_prompts[idx].lower():
                detected_brands.append(detected_item)
            else:
                detected_objects.append(detected_item)
    return detected_objects, detected_brands

async def extract_objects_from_caption(caption):
    prompt = (
        f"Given the description: '{caption}', identify and list all distinct objects mentioned as individual items, "
        "excluding any general descriptive words. Return a comma-separated list of distinct object names."
    )
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100,
        temperature=0.7
    )
    objects = response['choices'][0]['message']['content']
    objects = re.split(r'[,\n;|-]', objects)
    return [obj.strip() for obj in objects if obj.strip()]

def clean_identified_objects(objects):
    cleaned_objects = []
    for obj in objects:
        cleaned_obj = re.sub(r'^\\d+\\.\\s*', '', obj).strip()
        cleaned_objects.append(cleaned_obj.capitalize())
    return list(set(cleaned_objects))

def consolidate_objects_and_brands(yolo_objects, caption_objects, yolo_brands, clip_objects, clip_brands, famous_brands_from_description):
    combined_objects = list(set(yolo_objects + caption_objects + [obj for obj, _ in clip_objects]))
    combined_brands = list(set(yolo_brands + [brand for brand, _ in clip_brands] + famous_brands_from_description))

    # Clean the brands and remove duplicates
    combined_brands = clean_identified_brands(combined_brands)

    # If no valid brands are found, explicitly include 'None'
    if not combined_brands:
        combined_brands = ["None"]

    return clean_identified_objects(combined_objects), combined_brands

# Unified function for analyzing a single frame/image (modified to collect data without API calls)
async def analyze_frame(image):
    # Generate caption using BLIP
    blip_caption = generate_blip_caption(image)

    # Detect objects using YOLO (Separate thresholds for objects and brands)
    yolo_objects = detect_objects_with_yolo(image, object_model, confidence_threshold=0.6)  # Object threshold
    yolo_brands = detect_objects_with_yolo(image, logo_model, confidence_threshold=0.8)    # Brand threshold

    # Extract objects and brands from BLIP caption using OpenAI
    caption_objects = await extract_objects_from_caption(blip_caption)
    famous_brands = await detect_famous_brands_from_description(blip_caption)

    # Generate text prompts based on BLIP caption for CLIP detection
    clip_prompts = await extract_objects_from_caption(blip_caption)
    clip_objects, clip_brands = detect_objects_with_clip(image, clip_prompts)

    # Consolidate all detected objects and brands
    consolidated_objects, consolidated_brands = consolidate_objects_and_brands(
        yolo_objects, caption_objects, yolo_brands, clip_objects, clip_brands, famous_brands
    )

    # Ensure 'None' is included only when no brands are found
    return {
        "Description": blip_caption,
        "Identified Objects": consolidated_objects,
        "Identified Brands": consolidated_brands
    }

# Aggregation function for scenes with optimized API calls
async def analyze_scene(frames):
    descriptions = []
    all_objects = []
    all_brands = []

    # Collect data for all frames first
    for frame in frames:
        frame_result = await analyze_frame(frame)
        descriptions.append(frame_result["Description"])
        all_objects.extend(frame_result["Identified Objects"])
        all_brands.extend(frame_result["Identified Brands"])

    # Make a single OpenAI API call for summarization
    summarized_description = await summarize_descriptions(descriptions)

    # Optionally, make a single call to detect famous brands across the aggregated descriptions
    combined_brands = await detect_famous_brands_from_description(" ".join(descriptions))

    unique_objects = list(set(all_objects))
    unique_brands = list(set(all_brands + combined_brands))

    # Ensure 'None' is included only when no brands are found
    unique_brands = [brand for brand in unique_brands if brand.lower() != "none"]
    if not unique_brands:
        unique_brands = ["None"]

    return {
        "Description": summarized_description,
        "Identified Objects": unique_objects,
        "Identified Brands": unique_brands
    }

# Function to determine if a file is an image or video
def is_image_file(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type and mime_type.startswith('image')

# Function to extract frames using combined scene detection with histogram and SSIM comparison
def extract_frames_with_combined_scene_detection(video_content, max_frames=10, scene_threshold=0.4, ssim_threshold=0.7):
    with tempfile.NamedTemporaryFile(suffix=".mp4") as temp_video:
        temp_video.write(video_content)
        temp_video.flush()
        cap = cv2.VideoCapture(temp_video.name)
        frames = []
        prev_hist = None
        prev_frame = None
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_step = max(1, total_frames // max_frames)
        frame_count = 0

        while len(frames) < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            if frame_count % frame_step == 0:
                gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                hist = cv2.calcHist([gray_frame], [0], None, [256], [0, 256])
                hist = cv2.normalize(hist, hist).flatten()

                if prev_hist is not None and prev_frame is not None:
                    # Histogram comparison
                    hist_diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)

                    # SSIM comparison
                    gray_prev_frame = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
                    ssim_score, _ = compare_ssim(gray_prev_frame, gray_frame, full=True)

                    # Check scene change conditions
                    if hist_diff < scene_threshold or ssim_score < ssim_threshold:
                        pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                        frames.append(pil_image)
                else:
                    # First frame case
                    pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                    frames.append(pil_image)

                prev_hist = hist
                prev_frame = frame
            frame_count += 1
        cap.release()
        return frames

# Unified endpoint for analyzing images and videos
@app.post("/analyze/")
async def analyze_media(url: str):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        media_content = response.content
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download media from the provided URL. {str(e)}")

    if is_image_file(url):
        try:
            image = Image.open(io.BytesIO(media_content))
            result = await analyze_frame(image)
            return result
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="The provided file is not a valid image.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process the image. {str(e)}")
    else:
        frames = extract_frames_with_combined_scene_detection(video_content=media_content, max_frames=10)
        result = await analyze_scene(frames)
        return result

# Function to summarize descriptions using OpenAI GPT
async def summarize_descriptions(descriptions):
    prompt = "Summarize the following descriptions into a single concise description:\n" + "\n".join(descriptions)
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.7
    )
    return response['choices'][0]['message']['content'].strip()