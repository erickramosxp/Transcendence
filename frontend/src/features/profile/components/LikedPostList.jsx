import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { getLikedPosts } from "../services/profileService";
import { PostListUI } from "./PostListUI";
import { usePostList } from "../hooks/usePostList";

import { useTranslation } from "react-i18next";
import { Loading } from "@/design-system";

export function LikedPostList({ username }) {

  const [loading, setLoading] = useState(true);
  const { posts, loadInitial, ...handlers } = usePostList(
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


  if (loading)
    return <Loading size="md" className="py-10" />

  return <PostListUI posts={posts} {...handlers} />;
}