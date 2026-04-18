import React from 'react'
import FriendCard from './FriendCard'
import { useFriendsContext } from '../Context/FriendsContext'
import { PaginatedSearchList } from './PaginatedSearchList'
import { FRIENDSHIP_STATUS } from '@/shared/constants/friendship'

const FriendRequests = () => {


  const { requests, loading } = useFriendsContext();

  return (
    <PaginatedSearchList 
      showSearch={false}
      data={requests}
      loading={loading}
      loadingMore={false}
      hasMore={false}
      onFetch={() => {}}
      emptyMessage="Você não tem nenhum pedido de amizade pendente."
      renderItem={(request) => (
        <FriendCard 
          key={request?.friendshipId}
          user={request}
          friendshipState={FRIENDSHIP_STATUS.PENDING_RECEIVED}
        />
      )}
    />
  )
}

export default FriendRequests
