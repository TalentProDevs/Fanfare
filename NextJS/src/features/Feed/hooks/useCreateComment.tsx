import { useMutation } from "@apollo/client";
import { CREATE_COMMENT } from "../graphql";
import { CreateCommentInput, Post } from "../types";

export const useCreateComment = () => {
  const [makeComment, { data }] = useMutation(CREATE_COMMENT);
  const createComment = async (input: CreateCommentInput) => {
    try {
      const { _id, ...createCommentInput } = input;
      return await makeComment({
        variables: {
          createPostCommentInput: createCommentInput,
        },
      });
    } catch {
      console.log("");
    }
  };

  const createNewCommentInput = (
    singleSelectedPost: Post,
    currentComment: string,
    commentId?: string,
    isReply: boolean = false,
    actionLevel: string ='MAIN',
    breadCrump: string = 'Comunity/Feed',
    contentId?: string,
    contentType?: string
  ) => {
    return {
      postId: singleSelectedPost._id,
      comment: currentComment,
      commentId,
      isReply,
      _id: commentId,
      actionLevel:singleSelectedPost?.postType==="MULTIPLE_CONTENT"?"SUB":"MAIN", //
      activityPath: {
        widgetName: "Web",
        breadCrump,
      },
      contentId,
      contentType,
      contentCreatorId: singleSelectedPost?.user?._id,
      contentVariation: singleSelectedPost.contentVariation,
      numOfContent: singleSelectedPost.numOfContent,
      postType: singleSelectedPost.postType,
      sequenceLogic: singleSelectedPost.logicType,
      
     
    };
  };

  return {
    createComment,
    createNewCommentInput,
    newComments: data?.createPostComment,
  };
};
