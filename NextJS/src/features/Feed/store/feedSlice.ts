import { createSlice } from "@reduxjs/toolkit";
import { postViewObject } from "../types";
interface FeedState {
  viewedPost: postViewObject[];
}
const initialState: FeedState = {
  viewedPost: [],
};
const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    addViewData: (state, action) => {
      state.viewedPost = [...state.viewedPost, action.payload];
      //state.viewedPostIds = [...state.viewedPostIds, action.payload?.postId];
    },
    removeViewPost: (state) => {
      state.viewedPost = [];
    },
  },
});

export const { addViewData, removeViewPost } = feedSlice.actions;
export default feedSlice.reducer;
