import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { usePostList } from "../hooks/usePostList";
import  PostCard  from "@/features/feed/components/PostCard";
import { getUserMediaPosts } from '../services/profileService';

import { Modal, Loading } from "@/design-system";

export function MediaGrid({ username }) {

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const { posts, loadInitial, handleLike, toggleComments, activeCommentsPostId, incrementCommentCount, ...handlers } = usePostList(
  (page, size) => getUserMediaPosts(username, page, size)
);

  useEffect(() => {

    const getUserMediaPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {
        console.error(err);
        toast.error("Falha ao buscar mídias do usuário");
      } finally {
        setLoading(false);
      }
    }

    getUserMediaPosts();
  }, [username]);


  if (loading)
    return <Loading size="md" className="py-10" />

  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">
        Nenhuma mídia ainda.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelected(posts.find((p) => p.id === item.id))}
          >
            <img
              src={item?.mediaUrl || null}
              alt={item.alt ?? "mídia"}
              width={300} height={300}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <Modal
        size="lg"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <PostCard 
            onLike={handleLike}
            onToggleComments={toggleComments}
            activeCommentsPostId={activeCommentsPostId}
            incrementCommentCount={incrementCommentCount}
          className="p-0! shadow-none! border-none! rounded-none!"
          post={selected}
          />
        )}
      </Modal>
    </>
  );
}

