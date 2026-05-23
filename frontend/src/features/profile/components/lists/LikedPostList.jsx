import React, { useEffect, useState } from "react";
import { getLikedPosts } from "@/features/profile/services/profileService";
import { PostListUI } from "@/features/profile/components/lists/PostListUI";
import { usePostList } from "@/features/profile/hooks/usePostList";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { toast } from 'react-toastify';

import { useTranslation } from "react-i18next";
import { Loading } from "@/design-system";

export function LikedPostList({ username }) {

  const [loading, setLoading] = useState(true);
  const { userData } = useProfile();
  const { posts, loadInitial, setPosts, ...handlers } = usePostList(
    (page, size) => getLikedPosts(username, page, size)
  );
  const { t } = useTranslation('profile');

  useEffect(() => {

    const getUserLikedPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {
        console.error(err);
        toast.error(t('likedPosts.error'));
      } finally {
        setLoading(false);
      }
    }

    getUserLikedPosts();
  }, [username]);

  useEffect(() => {
    if (!userData?.username) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.username === userData.username
          ? {
              ...post,
              avatarUrl: userData.avatarUrl,
              name: userData.name ?? post.name,
            }
          : post,
      ),
    );
  }, [userData.avatarUrl, userData.name, userData.username, setPosts]);


  if (loading)
    return <Loading size="md" className="py-10" />

  return <PostListUI posts={posts} {...handlers} />;
}