import React from "react";
import ShowDescription from "./ShowDescription";
import PostTitle from "./PostTitle";
import Hastags from "./Hastags";
import BrandTags from "./BrandTags";

export default function PostMetaSection({ post }: { post: any }) {
  if (!post) return null;
  return (
    <>
      {post?.title && <PostTitle title={post.title} />}
      {post?.description && <ShowDescription description={post.description} />}
      {post?.hashtags?.length > 0 && <Hastags hashTags={post.hashtags} />}
      {post?.brandtags?.length > 0 && <BrandTags brandTags={post.brandtags} />}
    </>
  );
}
