import React from 'react'
import { AvatarWithStatus, Card, CardContent } from '@/design-system'
import FriendshipButton from './FriendshipButton'
import { useFriendsContext } from '../Context/FriendsContext';

const FriendCard = ({ user, friendshipState }) => {

  const {
    removeRequest,
    removeFriend,
    acceptRequest
  } = useFriendsContext();

  const handleSuccess = (action, data) => {

    if (action === "accept") {
      acceptRequest({
        ...user,
        friendshipId: data.friendshipId
      });
    }
    
    if (action === "reject") {
      removeRequest(data.friendshipId);
    }

    if (action === "unfriend") {
      removeFriend(data.friendshipId);
    }
  };

  return (
    <Card>
      <CardContent className='flex items-center justify-between p-4 [&:last-child]:pb-4'>
        <div className='flex items-center gap-3'>
          <AvatarWithStatus
            name={user?.name}
            username={user?.username}
            src={user?.avatarUrl}
            status={user?.isOnline ? 'online' : 'offline'}
          />
          <div>
            <p className='font-medium'>{user?.name}</p>
            <p className='text-muted-foreground'>@{user?.username}</p>
          </div>
        </div>
        <div>
          <FriendshipButton
            friendshipId={user?.friendshipId}
            targetUserId={user?.friendId}
            initialStatus={friendshipState}
            onSuccess={handleSuccess}
            variant='inline'
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default FriendCard
