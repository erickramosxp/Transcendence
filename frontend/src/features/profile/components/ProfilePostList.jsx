import React, { useEffect, useState } from "react";
import { PostListUI } from "./PostListUI";
import { getUserPosts } from "../services/profileService";
import { usePostList } from "../hooks/usePostList";
import { toast } from 'react-toastify';

import { Loading } from "@/design-system";

export function ProfilePostList({ username }) {


  const { posts, loadInitial, ...handlers } = usePostList(
    (page, size) => getUserPosts(username, page, size)
  );
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      
      const getUserPosts = async () => {
        try {
          await loadInitial();

        } catch(err) {

          console.error(err);
          toast.error("Falha ao buscar posts do usuário");
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