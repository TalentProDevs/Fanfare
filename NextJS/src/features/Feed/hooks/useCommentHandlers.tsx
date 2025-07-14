import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import fallbackImage from "@/public/icons/human_solid.svg";
import { addDimensionsToUrl } from "@/shared/utils/addDimentionsToUrl";
import useGetCdnlink from "@/shared/hooks/useCdnLink";
import { UserType } from "@/shared/types";
import { initialComment } from "../data";



export default function useCommentHandlers() {

  const { getCdnLink } = useGetCdnlink();
  const { data: userData } = useSession();

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserType>();
  const [currentComment, setCurrentComment] = useState(initialComment);
  const [isReply, setIsReply] = useState(false);
  const [name, setName] = useState("");
  const [commentId, setCommentId] = useState("");
  const [isEditComment, setIsEditComment] = useState(false);
  const [isEditReply, setIsEditReply] = useState(false);
  const [replyId, setReplyId] = useState("");
  const [isCommentTextEmpty, setIsCommentTextEmpty] = useState(false);

  const commentSectionRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const baseUrl = userData?.user?.dp || null;
    if (!baseUrl) {
      setImgSrc(fallbackImage.src);
      return;
    }
    const modifiedUrl = addDimensionsToUrl(baseUrl, 70, -1);
    const checkImage = async (url: string) => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        setImgSrc(response.ok ? getCdnLink(url) : getCdnLink(baseUrl));
      } catch {
        setImgSrc(getCdnLink(baseUrl));
      }
    };
    checkImage(modifiedUrl);
  }, [userData?.user?.id]);

  useEffect(() => {
    setLoggedInUser(userData?.user as UserType);
    if (userData?.user) {
      setCurrentComment({
        ...initialComment,
        user: {
          _id: userData?.user?.id,
          dp: imgSrc as string,
          name: userData?.user?.name,
        },
      });
    }
  }, [userData, imgSrc]);

  const handleReplyInputOpen = (name: string, commentId: string) => {
    setIsReply(true);
    setName(name);
    setCommentId(commentId);
    setIsEditComment(false);
    setCurrentComment((prev) => ({ ...prev, comment: "" }));
  };

  const handleReplyInputClose = () => {
    setIsReply(false);
    setName("");
    setCommentId("");
    setReplyId("");
    setIsEditComment(false);
    setIsEditReply(false);
    setCurrentComment((prev) => ({ ...prev, comment: "" }));
  };

  const handleCommentWriting = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    const value = event.target.value;
    setCurrentComment((prev) => ({ ...prev, comment: value }));
    setIsCommentTextEmpty(value.trim() === "");
  };

  const handleEditComment = (comment: Comment) => {
    setIsEditComment(true);
    setIsReply(false);
    setIsEditReply(false);
    setCommentId(comment.commentId || comment._id);
    inputRef.current?.focus();
    setCurrentComment((prev) => ({ ...prev, comment: comment.comment }));
  };

  const handleEditReply = (reply: ReplyType, commentId: string) => {
    setIsEditReply(true);
    setIsEditComment(false);
    setIsReply(false);
    setReplyId(reply._id);
    setCommentId(commentId);
    inputRef.current?.focus();
    setCurrentComment((prev) => ({ ...prev, comment: reply.comment, _id: reply._id }));
  };

  const handleSubmitComment = async () => {
    // Implement your logic here
  };

  const handleKeyEnterSubmitComment = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (window.innerWidth < 500) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentComment.comment.trim() === "") {
        setIsCommentTextEmpty(true);
        return;
      }
      currentComment.comment = currentComment.comment.replace(/\n{3,}/g, "\n\n");
      handleSubmitComment();
    }
  };

  return {
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
    handleReplyInputOpen,
    handleReplyInputClose,
    handleEditComment,
    handleEditReply,
    handleSubmitComment,
    handleKeyEnterSubmitComment,
  };
}