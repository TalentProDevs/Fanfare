import { useMutation } from "@apollo/client";
import { REPORT_POST } from "../graphql";

export const useReportPost = () => {
  const [reportPost] = useMutation(REPORT_POST);
  const handlePostReport = (postId: string, reason: string) => {
    reportPost({
      variables: {
        postId,
        reason,
      },
    });
  };

  return { handlePostReport };
};
