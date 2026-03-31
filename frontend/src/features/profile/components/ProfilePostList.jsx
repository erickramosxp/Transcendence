import React, { useEffect, useState } from "react";
import { PostListUI } from "./PostListUI";
import { getUserPosts } from "../services/profileService";
import { usePostList } from "../hooks/usePostList";
import Loading from "@/design-system/components/Loading";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

export function ProfilePostList({ username }) {


  const { posts, loadInitial, ...handlers } = usePostList(
    (page, size) => getUserPosts(username, page, size)
  );
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('profile');

    useEffect(() => {
      
      const getUserPosts = async () => {
        try {
          await loadInitial();

        } catch(err) {

          console.error(err);
          toast.error(t('postList.error'));
        } finally {
          setLoading(false);
        }
      }

      getUserPosts();
    }, [username]);

    if(loading)
      return <Loading size="md" className="py-10"/>
  return <PostListUI posts={posts} {...handlers} />;
}