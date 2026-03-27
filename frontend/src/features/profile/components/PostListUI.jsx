import React from "react";
import PostCard from "@/features/feed/components/PostCard";
import { Card } from "@/design-system";

export function PostListUI({
  posts,
  hasMore,
  isLoadingMore,
  sentinelRef,
  activeCommentsPostId,
  handleLike,
  toggleComments,
  incrementCommentCount,
}) {

return (
    <div className="space-y-6">
      {posts?.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Nada por aqui ainda.
        </div>
      ) : (
        <>
          {posts?.map((post, index) => (
            <Card
              key={`${post.id}-${index}`}
              className="border-border bg-card/90 backdrop-blur-xl shadow-xl"
            >
              <PostCard
                post={post}
                onLike={handleLike}
                onToggleComments={toggleComments}
                activeCommentsPostId={activeCommentsPostId}
                incrementCommentCount={incrementCommentCount}
              />
            </Card>
          ))}

          <div ref={sentinelRef} className="h-4" aria-hidden />

          {isLoadingMore && (
            <div className="py-4 text-center text-muted-foreground">
              Carregando mais…
            </div>
          )}

          {!hasMore && posts?.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Você chegou ao fim
            </div>
          )}
        </>
      )}
    </div>
  );
}