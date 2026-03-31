import { useState, useEffect } from "react";
import { Modal } from "@/design-system/components/Modal";
import  PostCard  from "@/features/feed/components/PostCard";
import { usePostList } from "../hooks/usePostList";
import { getUserMediaPosts, getPostUserDetails } from '../services/profileService'
import Loading from "@/design-system/components/Loading";
import { toast } from 'react-toastify';
import { resolveMediaType } from "@/shared/resolveMediaType";
import { useTranslation } from "react-i18next";

export function MediaGrid({ username }) {

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('profile');

  const { posts, loadInitial, handleLike, toggleComments, activeCommentsPostId, incrementCommentCount, ...handlers } = usePostList(
  (page, size) => getUserMediaPosts(username, page, size)
);

  useEffect(() => {

    const getUserMediaPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {
        console.error(err);
        toast.error(t('mediaGrid.getMidaError'));
      } finally {
        setLoading(false);
      }
    }

    getUserMediaPosts();
  }, [username]);

  const getPostDetails = async (postId) => {

    try {
      const resp = await getPostUserDetails(postId);
      setSelected(resp);
    } catch (err) {
      console.error(err);
      toast.error(t('mediaGrid.getPostError'));
    }
  }


  if (loading)
    return <Loading size="md" className="py-10" />

  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">
        {t('mediaGrid.empty')}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((item, index) => (
          <div
            key={`${item.postId}-${index}`}
            className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => getPostDetails(item.postId)}
          >
            { resolveMediaType(item?.mediaUrl, null) === 'video' ?
              <video 
                src={item.mediaUrl}
                className="h-full w-full object-cover"
                muted
                preload="metadata"
              >
              </video>
            :
              <img
                src={item?.mediaUrl || null}
                alt={item.alt ?? "mídia"}
                width={300} height={300}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            }
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

