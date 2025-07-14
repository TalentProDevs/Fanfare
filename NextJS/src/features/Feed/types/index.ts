import { Dispatch, SetStateAction } from "react";

export enum ContentTypeEnum {
  VIDEO = "VIDEO",
  PHOTO = "PHOTO",
}
type ImageDetailsObject = {
  height?: number;
  imageUrl?: string;
  width?: number;
};

type PhotoWithSizeVariation = {
  high?: ImageDetailsObject;
  low?: ImageDetailsObject;
  medium?: ImageDetailsObject;
};

export type PostPhotoObject = {
  _id: string;
  commentCount?: number;
  contentType: string;
  likeCount: number;
  isLiked?: boolean;
  photo?: PhotoWithSizeVariation;
  position: number;
  privacy?: string;
  shareCount: number;
  shareableLink: string | null;
  status: string;
  viewCount?: number;
};

type CoverSizeType = {
  height: number;
  width: number;
};

type PresentVideo = {
  cover?: string;
  cover_size: CoverSizeType;
  duration: number;
  owner?: string;
  size?: number;
  url?: string;
};

export type PostPresentObject = {
  position: number;
  _id: string;
  contentType?: string;
  comments_count?: number;
  gpVideoId?: string | null;
  likes_count?: number;
  privacy?: string;
  private?: boolean;
  published?: boolean;
  shared_count?: number;
  status?: string;
  video: PresentVideo;
  videoShareableLink?: string | null;
  views_count: number;
  isLiked?: boolean;
};

type PostUserFFId = {
  f_id?: string;
};

type Verification = {
  status?: string;
};

export type PostUserDetails = {
  _id: string;
  dp: string;
  fanfare_id?: PostUserFFId;
  gender?: string;
  name: string;
  status: string;
  verification?: Verification | null;
};

type Theme = {
  _id: string; // MongoDB ObjectId as a string
  imageUrl: string; // URL of the theme's image
  themeTitle?: string; // Title of the theme
  textHexCode: string; // Text color in hexadecimal format
};

export type PostWithThemeProps={
  theme:Theme,
  description: string
}

export type Post = {
  _id: string;
  isBlocked?: boolean;
  isHide?: boolean;
  brandtags?: string[];
  commentCount: number;
  createdAt: string;
  description?: string;
  descriptionUrls?: string[];
  hashtags: string[];
  likeCount: number;
  isLiked?: boolean;
  photo: PostPhotoObject[];
  postType: string;
  pushToFeed?: string | null;
  removeFromFeed?: string;
  present: PostPresentObject[];
  privacy?: string;
  shareCount: number;
  status: string;
  taggedUsers?: string[];
  theme?: Theme;
  title?: string;
  updatedAt: string;
  user?: PostUserDetails;
  viewCount: number;
  isSingleContent: boolean;
  contentVariation?: string;
  numOfContent: number;
  logicType?: string;
  actionLevel: string;
  actionType: string;
  contentCreatorId: string;
  numberOfContent: number;
  contentId: string;
  contentType: string;
  breadcrump: string;
  sharedPostId?: string;
  sharedPost?: Post;
};

export type postViewObject = {
  actionDate: string;
  actionLevel: string;
  postId: string;
  postType: string;
  numOfContent: number;
  contentVariation?: string;
  contentType: string;
  contentId?: string;
  contentCreatorId: string;
  logicType: string;
  watchTime?: number;
};

export type ReplyType = {
  _id: string;
  user: PostUserDetails;
  comment: string;
  createdAt: string;
  likeCount: number;
  isLiked?: boolean;
  commentLikesCount: number;
  postId: string;
};

export type replyCommentType = {
  isReplyOpen: boolean;
  commentId: string;
  replies: ReplyType[];
  contentId?: string;
};
export type CardProps = {
  feedContent: Post;
  isLastCard?: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isFromFeed?: boolean;
  userId?: string;
  isLoggedinUser?: boolean;
  visibleCount?: number;
};
export type ShowDetailsProps = {
  isFullScreen: boolean;
  handleFullScreen: () => void;
  url: string;
  height: number;
  width: number;
  cover?: string;
  type?: ContentTypeEnum;
  autoPlay?: boolean;
  muted?: boolean;
  totalItems: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  postData: Post;
  contentId: string;
  deviceWidth: number;
};
export type ShowPhotoProps = {
  url: string;
  height: number;
  width: number;
  totalItems: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  deviceWidth: number;
};

export type ShowFeedContentProps = {
  cover?: string;
  height: number;
  width: number;
  url: string;
  type?: ContentTypeEnum;
  autoPlay?: boolean;
  muted?: boolean;
  setContentLoaded?: React.Dispatch<React.SetStateAction<boolean>>;
  setSingleVideoWatchTime?: React.Dispatch<React.SetStateAction<number>>;
  postId?: string;
};

export type ShowSliderProps = {
  feedContent: Post;
};

export type RightProps = {
  userId?: string;
  userDp: string | null;
  userName: string;
  description?: string;
  isVarified: boolean;
  isSingleContent: boolean;
  currentItem?: PostContentType;
  post?: Post;
  fullText?: boolean;
  title?: string;
};

export type PostContentType = PostPresentObject | PostPhotoObject;

export type PostData = Post[];

export interface CreateCommentInput {
  postId: string;
  comment: string;
  actionLevel?: string;
  activityPath?: {
    widgetName: string;
    breadCrump: string;
  };
  _id?: string;
  contentCreatorId?: string;
  contentVariation?: string;
  numOfContent?: number;
  postType?: string;
  sequenceLogic?: string;
  userActivityInput?: {
    device: {
      deviceId: string;
      deviceModel: string;
    };
  };
}

export interface CommentSectionProps {
  theme: string;
  singleSelectedPost: Post;
  postCreatorId: string;
  ref?: React.RefObject<HTMLDivElement>;
  handleEditComment: (comment: Comment) => void;
  handleEditReply: (reply: ReplyType, commentId: string) => void;
  handleReplyInputOpen: (name: string, commentId: string) => void;
  currentItem?: PostContentType;
}

interface User {
  _id: string;
  dp: string;
  name: string;
}

export interface Comment {
  comment: string;
  commentId: string;
  commentLikesCount: number;
  isLiked: boolean;
  isReply: boolean;
  replyCount: number;
  user: User;
  postId: string;
  createdAt: string;
  _id: string;
}

export interface CommentReplyCreateProps {
  isReply: boolean;
  name: string;
  handleSubmitComment: () => void;
  theme: string;
  imgSrc: string;
  setImgSrc: React.Dispatch<React.SetStateAction<string | null>>;
  handleCommentWriting: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyEnterSubmitComment: (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  currentComment: Comment;
  isEditComment: boolean;
  isEditReply: boolean;
  setIsEditComment: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditReply: React.Dispatch<React.SetStateAction<boolean>>;
  isCommentTextEmpty: boolean;
  handleReplyInputClose: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isSubmit?: boolean;
}

export interface InteractionDetailsProps {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  cardRef: React.RefObject<HTMLDivElement>;
  border?: number;
  currentItem?: PostContentType;
  post?: Post;
  isLiked?: boolean;
}
export interface PhotoPost {
  _id: string;
  commentCount: number;
  contentVariation: string;
  createdAt: string; // ISO date string
  isPost: boolean;
  isSingleContent: boolean;
  likeCount: number;
  likeCountPercentage: number;
  numOfContent: number;
  photo: PhotoWithSizeVariation;
  postId: string;
  postType: string;
  shareCount: number;
  shareableLink: string;
  status: string;
  viewCount: number;
  user: User;
}
export interface Season {
  _id: string;
}
export interface Game {
  _id: string;
  title: string;
  channelName: string;
  brandName: string;
  description: string;
  profileImage: string;
  thumbnailImage: string;
  bannerImage: string;
  gameUrl: string;
  isActive: boolean;
  season: Season;
}
