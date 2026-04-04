import React from "react";
import PostCard from "@/features/feed/components/PostCard";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
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

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  return (
    <div className="space-y-6">
      {posts?.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t('postsUI.empty')}<br />
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
              {t('postsUI.loadMore')}
            </div>
          )}

          {!hasMore && posts?.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {t('postsUI.end')}
            </div>
          )}
        </>
      )}
    </div>
  );
}