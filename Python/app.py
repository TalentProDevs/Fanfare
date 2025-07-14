from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pandas as pd
from langdetect import detect, DetectorFactory

# Ensures reproducibility of language detection results
DetectorFactory.seed = 0

class CommentPredictor:
    def __init__(self, model_path: str, data_path: str):
        # Initialize class variables
        self.model_path = model_path
        self.data_path = data_path
        self.max_words = 10000
        self.max_seq_len = 100
        
        # Load the model and tokenizer
        self.model = tf.keras.models.load_model(model_path)
        self.tokenizer = self._load_tokenizer()

    def _load_tokenizer(self) -> Tokenizer:
        # Load and preprocess the dataset to initialize the tokenizer
        data = pd.read_excel(self.data_path)
        texts = data['comment'].astype(str).tolist()
        tokenizer = Tokenizer(num_words=self.max_words)
        tokenizer.fit_on_texts(texts)
        return tokenizer

    def detect_language(self, text: str) -> str:
        try:
            return detect(text)
        except:
            return "Unknown"

    def predict(self, comment: str) -> dict:
        # Check if the input comment is empty
        if not comment.strip():
            return {
                "status": 0,
                "msg": "no content provided"
            }

        # Detect the language of the comment
        language = self.detect_language(comment)
        
        if language != 'bn':  # 'bn' is the language code for Bangla
            return {
                "status": 0,
                "input": comment,
                "msg": "not supported language"
            }

        # Tokenize and pad the comment, then predict
        tokenized_comment = self.tokenizer.texts_to_sequences([comment])
        padded_comment = pad_sequences(tokenized_comment, maxlen=self.max_seq_len)
        prediction = self.model.predict(padded_comment)[0][0]
        
        # Determine prediction
        result = "vulgar" if prediction >= 0.2 else "non-vulgar"
        
        # Calculate vulgar percentage
        vulgar_percentage = prediction * 100
        
        return {
            "status": 1,
            "input": comment,
            "msg": result,
            "vulgar_percentage": f"{vulgar_percentage:.2f}"
        }

# Create a FastAPI instance
app = FastAPI()

# Initialize the CommentPredictor
predictor = CommentPredictor(
    model_path=r'D:\AI\Test\text_model.keras',  # Update with the path to your model
    data_path=r'D:\AI\Test\data new.xlsx'  # Replace with your dataset path
)

class CommentRequest(BaseModel):
    title: str
    description: str

@app.post("/predict")
async def predict_sentiment(request: CommentRequest):
    try:
        # Predict for the title
        title_result = predictor.predict(request.title)
        
        # Predict for the description
        description_result = predictor.predict(request.description)
        
        return {
            "title": {
                "status": title_result["status"],
                "input": title_result.get("input", ""),
                "msg": title_result["msg"],
                **({"vulgar_percentage": title_result["vulgar_percentage"]} if "vulgar_percentage" in title_result else {})
            },
            "description": {
                "status": description_result["status"],
                "input": description_result.get("input", ""),
                "msg": description_result["msg"],
                **({"vulgar_percentage": description_result["vulgar_percentage"]} if "vulgar_percentage" in description_result else {})
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For testing purposes: run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)