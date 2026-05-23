import React, { useEffect, useRef } from 'react'
import { Button, Loading, Scroll } from '@/design-system'
import { Globe, ChevronDown } from 'lucide-react';
import DetailedFriendCard from './DetailedFriendCard';
import { useTranslation } from 'react-i18next';

const FriendDiscoveryList = ({
  users = [],
  onAction,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  isLoadingFriends = false,
  page
}) => {

  const { t } = useTranslation('friends');
  const endListRef = useRef(null);

  useEffect(() => {
    if (page > 0 && users?.length > 0) {
      const scrollContainer = endListRef.current?.closest('.max-h-110');
      if (scrollContainer) {
        scrollContainer.scrollBy({ top: 150, behavior: 'smooth' });
      }
    }
  }, [users, page]);


  if (isLoadingFriends) {
    return (
      <div className='flex justify-center items-center min-h-30'>
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-4">

        {users && users.length > 0 ? (

          <Scroll className={'max-h-110'}>
            <div className="flex flex-col gap-4">
              {
                users.map((user, index) => (
                  <DetailedFriendCard
                    key={user.id + "-" + index}
                    user={user}
                    onAction={onAction}
                  />
                ))
              }
              <div ref={endListRef}></div>
            </div>
          </Scroll>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Globe size={40} className="text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground/80">{t('discovery.empty.notFound')}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {t('discovery.empty.discovery')}
            </p>
          </div>
        )}

      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? (
              <Loading size='sm' />
            ) : (
              <ChevronDown size={16} />
            )}
            <span>{isLoadingMore ? t('discovery.search.loadingMore') : t('discovery.search.loadMore')}</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export default FriendDiscoveryList
