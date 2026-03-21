import React, { useEffect, useState } from "react";
import { getLikedPosts } from "../services/profileService";
import { PostListUI } from "../PostListUI";
import { usePostList } from "../hooks/usePostList";
import Loading from "@/design-system/components/Loading";

export function LikedPostList({ userId }) {

  const [loading, setLoading] = useState(true);
  const { posts, loadInitial, ...handlers } = usePostList(
    (page, size) => getLikedPosts(userId, page, size)
  );

  useEffect(() => {

    const getUserLikedPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {

        console.err(err);
      } finally {
        setLoading(false);
      }
    }

    getUserLikedPosts();
  }, [userId]);


  if (loading)
    return <Loading size="md" className="py-10" />

  return <PostListUI posts={posts} {...handlers} />;
}