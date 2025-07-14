import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { CREATE_POST_VIEW } from "../graphql";
import { postViewObject } from "../types";
import { useState } from "react";
import { removeViewPost } from "../store/feedSlice";
export function useCreatePostView() {
  const [createView, { loading }] = useMutation(CREATE_POST_VIEW);
  const dispatch = useDispatch();
  const [numOfFailedCall, setNumOfFailedCall] = useState(0);

  const createPostView = (createPostViewInput: postViewObject[],activityLocation?:string) => {
    const payload = {
      createPostViewInput: createPostViewInput,
      userActivityTrackingPath: {
        breadCrump: activityLocation ? activityLocation: "Community/Feed",
      },
    };
    createView({
      variables: payload,
    })
      .then((res) => {
        dispatch(removeViewPost());
      })
      .catch(() => {
        if (numOfFailedCall >= 3) {
          dispatch(removeViewPost());
          setNumOfFailedCall(0);
        } else {
          setNumOfFailedCall((prev) => (prev + 1));
        }
      });
  };

  return { createPostView, loading };
}
