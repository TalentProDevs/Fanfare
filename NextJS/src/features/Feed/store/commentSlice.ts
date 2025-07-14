import { createSlice } from "@reduxjs/toolkit";
import { initialComment } from "../data";
const initialComments =[
    initialComment
]

export const  commentSlice = createSlice({
    name: "commentState",
    initialState: initialComments,
    reducers: {
        addComment: (state, action) => {
            state.unshift({...action.payload,_id:action.payload.commentId,commentLikesCount:0}); 
        },
        editComment:(state,action) =>{
            const commentToEdit = state.find((comment) => comment.commentId === action.payload.commentId || comment._id === action.payload.commentId); 
            if (commentToEdit) {
                commentToEdit.comment = action.payload.comment;
            }

        },
        deleteComment: (state, action) => {
            return state.filter((comment) => {
                return (  comment?._id !== action.payload && comment.commentId !== action.payload  );
              });
          
           
        },
        setInitialComments: (state, action) => {
        return action.payload;
        },
        updateReplyCount: (state, action) => {
            const { commentId, replyCount } = action.payload;
            const comment = state.find((comment) => comment._id === commentId);
            if (comment) {
                comment.replyCount = replyCount;}
        },
        updateCommentLikeCount: (state, action) => {
            const { commentId, commentLikesCount } = action.payload;
            const comment = state.find((comment) => comment._id === commentId);
           
            if (comment) {
                comment.isLiked = !comment.isLiked;
                comment.commentLikesCount  =Number(comment.commentLikesCount)+Number(commentLikesCount) ;
            }}
       
    },
})

export const {editComment, addComment, setInitialComments ,updateReplyCount,deleteComment,updateCommentLikeCount} = commentSlice.actions;
export default commentSlice.reducer;