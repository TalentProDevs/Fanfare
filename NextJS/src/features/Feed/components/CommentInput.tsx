import React from "react";
import CommentReplyCreate from "./interactions/CommentReplyCreate";

export default function CommentInput({
  isReply,
  name,
  isEditComment,
  isEditReply,
  imgSrc,
  theme,
  currentComment,
  inputRef,
  isCommentTextEmpty,
  handleCommentWriting,
  handleSubmitComment,
  handleKeyEnterSubmitComment,
  handleReplyInputClose,
}: any) {
  return (
    <CommentReplyCreate
      isReply={isReply}
      name={name}
      setIsEditComment={() => {}}
      setIsEditReply={() => {}}
      handleSubmitComment={handleSubmitComment}
      theme={theme}
      imgSrc={imgSrc}
      isEditComment={isEditComment}
      setImgSrc={() => {}}
      isEditReply={isEditReply}
      handleCommentWriting={handleCommentWriting}
      handleKeyEnterSubmitComment={handleKeyEnterSubmitComment}
      currentComment={currentComment}
      handleReplyInputClose={handleReplyInputClose}
      isCommentTextEmpty={isCommentTextEmpty}
      inputRef={inputRef}
    />
  );
}