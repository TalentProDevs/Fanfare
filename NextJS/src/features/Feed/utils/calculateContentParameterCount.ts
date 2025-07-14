import { Post } from "../types";

export const calculateContentParameterCount = (
    singlePost: Post | null,
    contentId?: string,
    contentType?: string,
    count: number = 0
): Post | null => {
    if (!singlePost) return null;
    const clonePost = structuredClone(singlePost);
 

    if (clonePost.postType === "MULTIPLE_CONTENT") {
        if (contentType === "PHOTO") {
            clonePost.photo.forEach((photo) => {
                if (photo._id === contentId) {
                    photo.commentCount = (photo.commentCount ?? 0) + count;
                }
            });
        } else if (contentType === "VIDEO") {
            clonePost.present.forEach((video) => {
                if (video._id === contentId) {
                    video.comments_count = (video.comments_count ?? 0) + count;
                }
            });
        }
    } else {
        clonePost.commentCount = (clonePost.commentCount ?? 0) + count;
    }
    return clonePost;
};
