import { useState, useEffect } from "react";
import  PostCard  from "@/features/feed/components/PostCard";
import { usePostList } from "@/features/profile/hooks/usePostList";
import { getUserMediaPosts, getPostUserDetails } from '@/features/profile/services/profileService'
import { Modal, Loading } from "@/design-system";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import { MediaGridRenderer } from "./midiaThumbnails/MediaGridRenderer";

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
            className="flex justify-center aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => getPostDetails(item.postId)}
          >
            <MediaGridRenderer 
              item={item}
            />
            {/* { resolveMediaTypeSync(item?.mediaUrl) === 'video' ?
              <VideoThumbnail thumbnailUrl={item.mediaUrl} />
            :
              <img
                src={item?.mediaUrl || null}
                alt={item.alt ?? "mídia"}
                width={300} height={300}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            } */}
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

