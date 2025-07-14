import { createSlice } from "@reduxjs/toolkit";
export interface LikeCache {
    postId: string;
    count: number;
    isLiked: boolean;
    isSent:boolean;
}
const initialState: LikeCache[] = [{
    postId: "",
    count: 0,
    isSent:true,
    isLiked: false,

}]
export const likeLocalCacheSlice = createSlice({
    name: "likeLocalCache",
    initialState,
    reducers: {
        removeFromCache: (state, action) => {
            return state.filter((like) => like.postId !== action.payload);
        },
        updateLikeCache: (state, action) => {
            const { postId, count } = action.payload;
            const existingLike = state.find((like) => like.postId === postId);
            if (existingLike) {
                existingLike.count += count;
                existingLike.isLiked = !existingLike.isLiked;
            }else {
                state.push(action.payload);
            }

        },
    },
})

export const { removeFromCache, updateLikeCache } = likeLocalCacheSlice.actions;
export default likeLocalCacheSlice.reducer;