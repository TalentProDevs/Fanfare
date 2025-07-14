import {
  faWhatsapp,
  faFacebook,
  faTwitter,
  faFacebookMessenger,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons';
export const initialComment ={
  comment: "",
  commentId: "",
  commentLikesCount: 0,
  isLiked: false,
  isReply: false,
  replyCount: 0,
  createdAt:new Date().toString(),
  user: {
    _id:"",
    dp: "",
    name: ""
  },
  postId:"",
  _id: "",

}

export interface Friend {
  _id: string;
  name: string;
  dp: string;
  status: string;
}
export const socialConnectionsTab=[{
  title:"Friends",
  key:"isFriend"
},
{
  title:"Fans",
  key:"isFan"
},{
  title:"Following",
  key:"isFollowing"
},
{
  title:"Suggested",
  key:"isSuggested"
}]

export const socialApps = [
  {
    name: 'WhatsApp',
    icon: faWhatsapp,
    color: '#25D366',
    webUrl: 'https://wa.me/?text=',
  },
  {
    name: 'Facebook',
    icon: faFacebook,
    color: '#1877F2',
    webUrl: 'https://www.facebook.com/sharer/sharer.php?u=',
  },
  {
    name: 'Twitter',
    icon: faTwitter,
    color: '#1DA1F2',
    webUrl: 'https://twitter.com/intent/tweet?text=',
  },
  {
    name: 'Messenger',
    icon: faFacebookMessenger,
    color: '#0084FF',
    webUrl: 'https://www.messenger.com/t/',
  },
  {
    name: 'Telegram',
    icon: faTelegram,
    color: '#0088CC',
    webUrl: 'https://t.me/share/url?url=',
  },
];