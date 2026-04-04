import React, { useEffect, useState } from "react";
import { getLikedPosts } from "../services/profileService";
import { PostListUI } from "./PostListUI";
import { usePostList } from "../hooks/usePostList";
import Loading from "@/design-system/components/Loading";
import { toast } from 'react-toastify';
import { useProfile } from "../hooks/ProfileContext";

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