
"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import Modal from "@/shared/components/Modal";
import PostMetaSection from "./../PostMetaSection";
import ModalHeader from "./../ModalHeader";
import CommentInput from "./../CommentInput";
import Interaction from "./InteractionSection";
import CommentSection from "./CommentSection";
import FeedContentForComments from "./PostContentForComment";
import useCommentHandlers from "./../../hooks/useCommentHandlers"
import usePostViewTracker from "./../../hooks/usePostViewTracker";

export default function CommentInteractionModal() {
  const dispatch = useDispatch();

  const isOpenCommentModal = useSelector(
    (state: RootState) => state.timeLine.isCommentModalOpen
  );
  const singleSelectedPost = useSelector(
    (state: RootState) => state.timeLine.singleSelectedPost
  );
  const theme = useSelector((state: RootState) => state.theme.theme);

  const {
    commentSectionRef,
    inputRef,
    currentComment,
    imgSrc,
    isReply,
    isEditComment,
    isEditReply,
    isCommentTextEmpty,
    name,
    handleCommentWriting,
    handleReplyInputClose,
    handleSubmitComment,
    handleKeyEnterSubmitComment,
    handleEditComment,
    handleEditReply,
    handleReplyInputOpen,
  } = useCommentHandlers();

  usePostViewTracker();

  const closeModal = () => dispatch({ type: "timeline/setOpenCommentModal", payload: false });

  return (
    <div className="flex justify-center items-center relative select-none">
      <Modal isOpen={isOpenCommentModal} onClose={closeModal}>
        <div className="flex flex-col items-center rounded-[10px] w-full tab-md:max-w-[700px] bg-white dark:bg-[#202124]">
          <ModalHeader user={singleSelectedPost?.user} theme={theme} />

          <div className="flex flex-col items-center w-full tab-md:max-w-[700px] h-[75vh] overflow-y-scroll">
            <PostMetaSection post={singleSelectedPost} />

            {singleSelectedPost?.photo && (
              <FeedContentForComments
                mergedFeedContent={[...(singleSelectedPost.photo || []), ...(singleSelectedPost.present || [])]}
              />
            )}

            {singleSelectedPost && (
              <Interaction
                feedContent={singleSelectedPost}
                cardRef={null} // Optional: update if you need tracking here
                border={700}
              />
            )}

            <CommentSection
              ref={commentSectionRef}
              singleSelectedPost={singleSelectedPost}
              theme={theme}
              postCreatorId={singleSelectedPost?.user?._id || ""}
              handleEditComment={handleEditComment}
              handleEditReply={handleEditReply}
              handleReplyInputOpen={handleReplyInputOpen}
            />
          </div>

         

          <CommentInput
            isReply={isReply}
            name={name}
            isEditComment={isEditComment}
            isEditReply={isEditReply}
            imgSrc={imgSrc || ""}
            theme={theme}
            currentComment={currentComment}
            inputRef={inputRef}
            isCommentTextEmpty={isCommentTextEmpty}
            handleCommentWriting={handleCommentWriting}
            handleSubmitComment={handleSubmitComment}
            handleKeyEnterSubmitComment={handleKeyEnterSubmitComment}
            handleReplyInputClose={handleReplyInputClose}
          />
        </div>
      </Modal>
    </div>
  );
}
