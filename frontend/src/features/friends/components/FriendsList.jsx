import React from 'react'
import FriendCard from './FriendCard'
import { useFriendsContext } from '../Context/FriendsContext'
import { PaginatedSearchList } from './PaginatedSearchList'
import { FRIENDSHIP_STATUS } from '@/shared/constants/friendship'

const FriendsList = () => {

  const {
    friends,
    loading,
    loadingMore,
    hasMoreFriends,
    fetchFriends
  } = useFriendsContext();


  return (
    <PaginatedSearchList 
      showSearch={true}
      data={friends}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMoreFriends}
      onFetch={fetchFriends}
      emptyMessage='Nenhuma por aqui ainda.'
      renderItem={(friend) => (
        <FriendCard 
          key={friend?.friendshipId || friend?.friendId}
          user={friend}
          friendshipState={FRIENDSHIP_STATUS.ACCEPTED}
        />
      )}
    />
  )
}

export default FriendsList
