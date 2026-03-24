import React from "react";
import PostCard from "@/features/feed/components/PostCard";
import { Card } from "@/design-system/primitives/Card";


export function PostListUI({ posts, hasMore, isLoadingMore, sentinelRef, activeCommentsPostId, handleLike, toggleComments, incrementCommentCount }) {

  return (
    <div className="space-y-8">
      {posts?.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-sm">
          Nada por aqui ainda.<br />
          {/* Seja o primeiro a compartilhar algo ✨ */}
        </div>
      ) : (
        <>
          {posts?.map((post, index) => (
            <Card key={`${post.id}-${index}`} className="border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
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
            <div className="text-center text-muted-foreground py-4">Carregando mais…</div>
          )}
          {!hasMore && posts?.length > 0 && (
            <div className="text-center text-muted-foreground py-4 text-sm">Você chegou ao fim</div>
          )}
        </>
      )}
    </div>
  );
}
