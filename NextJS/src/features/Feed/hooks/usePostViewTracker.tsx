// hooks/usePostViewTracker.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addViewData } from "../store/feedSlice";
import { addViewedPostId } from "../store/timelineSlice";


export default function usePostViewTracker(cardRef?: React.RefObject<HTMLDivElement>, videoWatchTime?: number) {
  const dispatch = useDispatch();
  const singleSelectedPost = useSelector(
    (state: RootState) => state.timeLine.singleSelectedPost
  );

  const prevWatchTime = useRef(0);

  useEffect(() => {
    if (!cardRef?.current || singleSelectedPost?.contentVariation === "V") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const postViewInput = {
              actionDate: new Date().toString(),
              actionLevel: "MAIN",
              postId: singleSelectedPost?._id,
              postType: singleSelectedPost?.postType,
              numOfContent: singleSelectedPost?.numOfContent,
              contentVariation: singleSelectedPost?.contentVariation,
              contentType: singleSelectedPost?.isSingleContent
                ? singleSelectedPost?.photo?.[0]?.contentType
                : null,
              contentId: singleSelectedPost?.isSingleContent
                ? singleSelectedPost?.photo?.[0]?._id
                : null,
              contentCreatorId: singleSelectedPost?.user?._id,
              sequenceLogic: singleSelectedPost?.logicType,
            };

            dispatch(addViewData(postViewInput));
            dispatch(addViewedPostId(singleSelectedPost._id));
          }
        });
      },
      { threshold: [0.6] }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [cardRef, singleSelectedPost]);

  useEffect(() => {
    if (singleSelectedPost?.contentVariation !== "V" || videoWatchTime === undefined) return;

    const diff = videoWatchTime - prevWatchTime.current;
    const hasSignificantWatchTime = diff >= 1 || (prevWatchTime.current > videoWatchTime && videoWatchTime >= 1);

    if (hasSignificantWatchTime) {
      const postViewInput = {
        actionDate: new Date().toString(),
        actionLevel: "MAIN",
        postId: singleSelectedPost?._id,
        postType: singleSelectedPost?.postType,
        numOfContent: singleSelectedPost?.numOfContent,
        contentVariation: singleSelectedPost?.contentVariation,
        contentType: singleSelectedPost?.isSingleContent
          ? singleSelectedPost?.present?.[0]?.contentType
          : null,
        contentId: singleSelectedPost?.isSingleContent
          ? singleSelectedPost?.present?.[0]?._id
          : null,
        contentCreatorId: singleSelectedPost?.user?._id,
        sequenceLogic: singleSelectedPost?.logicType,
        watchTime: Math.floor((hasSignificantWatchTime ? videoWatchTime : prevWatchTime.current) * 1000),
      };

      dispatch(addViewData(postViewInput));
      dispatch(addViewedPostId(singleSelectedPost._id));
    }

    prevWatchTime.current = videoWatchTime;
  }, [videoWatchTime, singleSelectedPost]);
}
