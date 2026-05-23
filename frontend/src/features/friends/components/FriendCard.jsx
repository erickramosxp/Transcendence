import React from 'react'
import { AvatarWithStatus, Card, CardContent } from '@/design-system'
import FriendshipButton from './FriendshipButton'
import { useFriendsContext } from '../Context/FriendsContext';
import { FRIENDSHIP_STATUS } from '@/shared/constants/friendship';

/**
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {keyof typeof FRIENDSHIP_STATUS} props.friendshipState - The current status of the friendship defined in FRIENDSHIP STATUS
 */
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
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <AvatarWithStatus
            name={user?.name}
            username={user?.username}
            src={user?.avatarUrl}
            status={user?.isOnline ? 'online' : 'offline'}
          />
          <div className='flex-1 min-w-0'>
            <p className='font-medium truncate'>{user?.name}</p>
            <p className='text-muted-foreground truncate'>@{user?.username}</p>
          </div>
        </div>
        <div className='shrink-0'>
          <FriendshipButton
            friendshipId={user?.friendshipId}
            targetUserId={user?.friendId}
            initialStatus={friendshipState}
            onSuccess={handleSuccess}
            variant='inline'
            className='shrink-0'
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default FriendCard
