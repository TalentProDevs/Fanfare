import { combineReducers } from "@reduxjs/toolkit";
import menuReducer from "../features/Navbar/activeMenuSlice";
import themeReducer from "../shared/components/Theme/themeSlice";
import timelineReducer from "../features/Feed/store/timelineSlice";
import replyReducer from "../features/Feed/store/repliesSlice";
import commentsReducer from "../features/Feed/store/commentSlice";
import likeLocalCacheReducer from "../features/Feed/store/likeLocalCacheSlice";
import modalReducer from "@/features/GlobalModal/modalSlice";
import loaderReducer from "../shared/components/GlobalLoader/loaderSlice";
import cdnReducer from "../shared/store/cdnSlice";
import feedReducer from "../features/Feed/store/feedSlice";
import videoReducer from "../features/video/store/videoSlice";
import followReducer from "../features/FollowUnfollow/store/FollowUnfollowSlice";
import videoCommentSlice from "@/features/video/store/videoCommentSlice";
import productReducer from "../features/CommunityShop/store/feedProductSlice";
import gameModalReducer from "@/features/Game/Components/gameModalSlice";
import videoRepliesSlice from "@/features/video/store/videoCommentReplies";
import chatThreadSlice  from "@/features/Navbar/store/chatThreadSlice";
import basicSettingsSlice from "@/features/Settings/store/basicSettingsSlice";
import userSlice  from "@/features/Search/store/userSlice";
import  searchKeySlice from "@/features/Search/store/searchKeySlice";
import  shareSlice  from "@/shared/store/shareSlice";

//All reducers will be combined here
const rootReducer = combineReducers({
  menu: menuReducer,
  theme: themeReducer,
  timeLine: timelineReducer,
  replyState: replyReducer,
  commentsState: commentsReducer,
  likeLocalCache: likeLocalCacheReducer,
  globalModal: modalReducer,
  globalLoader: loaderReducer,
  gameModal: gameModalReducer,
  s3ToCdn: cdnReducer,
  feed: feedReducer,
  video: videoReducer,
  follow: followReducer,
  videoComment: videoCommentSlice,
  product: productReducer,
  videoReply : videoRepliesSlice,
  chatThread: chatThreadSlice,
  basicSettings: basicSettingsSlice,
  userSearch: userSlice,
  search:searchKeySlice,
  share:shareSlice
});

export default rootReducer;
