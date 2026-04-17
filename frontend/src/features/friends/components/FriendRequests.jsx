import React from 'react'
import FriendCard from './FriendCard'
import { Loading } from '@/design-system'
import { useFriendsContext } from '../Context/FriendsContext'

const FriendRequests = () => {


  const { requests, loading } = useFriendsContext();

  return (
    <div>
      { loading ? <Loading /> :
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {requests && requests?.length > 0 ?
            (
              requests?.map((friend) => (
                <FriendCard key={friend?.friendId} user={friend} friendshipState='PENDING_RECEIVED'/>
              ))
            ) 
            :
            (
              <p>Nenhuma solicitação de amizade por enquanto</p> 
            )
          }
        </div>
      }
    </div>
  )
}

export default FriendRequests
