import React, { useEffect, useState } from "react";
import { getLikedPosts } from "@/features/profile/services/profileService";
import { PostListUI } from "@/features/profile/components/lists/PostListUI";
import { usePostList } from "@/features/profile/hooks/usePostList";
import Loading from "@/design-system/components/Loading";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { toast } from 'react-toastify';

export function LikedPostList({ username }) {

  const [loading, setLoading] = useState(true);
  const { userData } = useProfile();
  const { posts, loadInitial, setPosts, ...handlers } = usePostList(
    (page, size) => getLikedPosts(username, page, size)
  );

  useEffect(() => {

    const getUserLikedPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {
        console.error(err);
        toast.error("Falha ao buscar posts curtidos pelo usuário");
      } finally {
        setLoading(false);
      }
    }

    getUserLikedPosts();
  }, [username]);

  useEffect(() => {
    setPosts(prev =>
      prev.map(post =>
        post.userName === userData.username
          ? {
            ...post,
            avatarUrl: userData.avatarUrl
          }
          : post
      )
    );
  }, [userData.avatarUrl]);


  if (loading)
    return <Loading size="md" className="py-10" />

  return <PostListUI posts={posts} {...handlers} />;
}