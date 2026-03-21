import { useState, useEffect } from "react";
import { Modal } from "@/design-system/components/Modal";
import  PostCard  from "@/features/feed/components/PostCard";
import { usePostList } from "../hooks/usePostList";
import { getUserMediaPosts } from '../services/profileService'
import Loading from "@/design-system/components/Loading";

export function MediaGrid({ username, items = [] }) {

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const { posts, loadInitial, handleLike, toggleComments, activeCommentsPostId, incrementCommentCount,...handlers } = usePostList(
  (page, size) => getUserMediaPosts(username, page, size)
);

  useEffect(() => {

    const getUserMediaPosts = async () => {
      try {
        await loadInitial();

      } catch (err) {

        console.err(err);
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
              src={item.url}
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
          post={{
            id: selected.id,
            avatarUrl: selected.author.avatar,
            name: selected.author.name,
            userName: selected.author.username,
            created_at: selected.date_time,
            contents: selected.content,
            media: selected.url,
            likedByMe: selected.isLiked,
            likeCount: selected.likes,
            commentCount: selected.countComments,
          }}
          />
        )}
      </Modal>
    </>
  );
}


//     {
//   "items": [
//     {
//       "id": 0,
//       "name": "string",
//       "userName": "string",
//       "contents": "string",
//       "avatarUrl": "string",
//       "likedByMe": true,
//       "likeCount": 0,
//       "commentCount": 0,
//       "media": "string",
//       "created_at": "2022-03-10T12:15:50-04:00"
//     }
//   ],
//   "page": 0,
//   "size": 0,
//   "hasMore": true
// }
