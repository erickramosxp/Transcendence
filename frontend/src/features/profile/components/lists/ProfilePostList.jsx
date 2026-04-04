import React, { useEffect, useState } from "react";
import { PostListUI } from "@/features/profile/components/lists/PostListUI";
import { getUserPosts } from "@/features/profile/services/profileService";
import { usePostList } from "@/features/profile/hooks/usePostList";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { Loading } from "@/design-system";
import { toast } from 'react-toastify';

export function ProfilePostList({ username }) {


  const { posts, loadInitial, setPosts, ...handlers } = usePostList(
    (page, size) => getUserPosts(username, page, size)
  );
  const { userData } = useProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const getUserPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {

        console.error(err);
        toast.error("Falha ao buscar posts do usuário");
      } finally {
        setLoading(false);
      }
    }

    getUserPosts();
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