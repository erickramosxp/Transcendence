import React from "react";
import PostCard from "@/features/feed/components/PostCard";
import { Card } from "@/design-system/primitives/Card";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";


export function PostListUI({ posts, hasMore, isLoadingMore, sentinelRef, activeCommentsPostId, handleLike, toggleComments, incrementCommentCount }) {

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="space-y-8">
      {posts?.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-sm">
          {t('postsUI.empty')}<br />
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
            <div className="text-center text-muted-foreground py-4">{t('postsUI.loadMore')}</div>
          )}
          {!hasMore && posts?.length > 0 && (
            <div className="text-center text-muted-foreground py-4 text-sm">{t('postsUI.end')}</div>
          )}
        </>
      )}
    </div>
  );
}
