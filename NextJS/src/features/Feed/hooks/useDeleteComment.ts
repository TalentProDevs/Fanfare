import { useMutation } from "@apollo/client";
import { DELETE_COMMENT } from "../graphql";

interface DeviceInput {
  deviceId?: string | null;
  deviceModel?: string | null;
}

interface UserActivityInput {
  device: DeviceInput;
}

interface ActivityPathInput {
  breadCrump?: string | null;
  pageName?: string | null;
  widgetName?: string | null;
}

interface DeletePostCommentInput {
  commentId: string;
  comment?: string;
  contentId?: string | null;
  contentType?: string | null;
  isReply?: boolean;
  postId: string;
  userActivityInput?: UserActivityInput;
  activityPath?: ActivityPathInput;
  pathName?: string,
  postType?: string,
  actionLevel?: string,
  numOfContent?: number,
  sequenceLogic?: string,
  contentVariation?: string,
  contentCreatorId?: string
  
}

export const useDeleteComment = () => {
  const [deleteComment, { data, error, loading }] = useMutation(DELETE_COMMENT);

  const handleDeleteComment = (deletePostCommentInput: DeletePostCommentInput) => {
    deleteComment({
      variables: {
        deletePostCommentInput,
      },
    }).catch(()=>{
      if (process.env.ENVIRONMENT === "localhost") {
          console.log("Error in deleting comment");
      }
  }
  )
  };

  return { handleDeleteComment, data, error, loading };
};
