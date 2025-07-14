"use client";
import NetworkStatus from "@/features/CreatePost/OnlineOffline";
import { BlockUserModal } from "@/features/Feed/components/BlockUserModal";
import { DeletePopUp } from "@/features/Feed/components/DeleteModal";
import PostDetailsModal from "@/features/Feed/components/detailsInteraction/PostDetailsModal";
import CommentInteractionModal from "@/features/Feed/components/interactions/CommentInteractionModal";
import PostShareModal from "@/features/Feed/components/PostShareModal";
import { ReportPostModal } from "@/features/Feed/components/ReportPostModal";
import FeedLoader from "@/shared/components/FeedLoader";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";

const TimeLineFeed = dynamic(
  () => import("@/features/Feed/components/TimeLineFeed"),
  {
    ssr: false,
    loading: () => (
      <>
        <FeedLoader />
        <FeedLoader />
      </>
    ),
  }
);
export default function Home() {
  const isReportPostModalOpen = useSelector(
    (state: RootState) => state.timeLine.isReportModalOpen
  );
  const isBlockUserModalOpen = useSelector(
    (state: RootState) => state.timeLine.isBlockModalOpen
  );
  const isDeleteModalOpen = useSelector(
    (state: RootState) => state.timeLine.isDeleteModalOpen
  );

  return (
    <>
  
      {isReportPostModalOpen && <ReportPostModal />}
      {isBlockUserModalOpen && <BlockUserModal />}
      {isDeleteModalOpen && <DeletePopUp />}
      <CommentInteractionModal />
     <PostShareModal />
      <TimeLineFeed />
      <PostDetailsModal />
    </>
  );
}
