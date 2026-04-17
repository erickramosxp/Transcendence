import React, { useState } from 'react'
import FriendCard from './FriendCard'
import { Button, Input, Loading } from '@/design-system'
import { Search } from 'lucide-react'
import { useFriendsContext } from '../Context/FriendsContext'

const FriendsList = () => {

  const [search, setSearch] = useState('');

  const { friends, loading } = useFriendsContext();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-1.5'>
        <Input id='search' name='search' icon={<Search size={20} />} value={search} onChange={(e) => setSearch(e.target.value)}/>
        <Button className='cursor-pointer'>Buscar</Button>
      </div>
      { loading ? 
        <div className='flex items-center justify-center min-h-80'>
          <Loading /> 
        </div>
      :
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {friends && friends?.length > 0 ? (
            friends?.map((friend) => (
              <FriendCard key={friend?.friendId} user={friend} friendshipState='ACCEPTED'/>
            ))
          ) : (
          <p>Nenhuma amizade por enquanto</p> 
        )
        }
        </div>
      }
    </div>
  )
}

export default FriendsList
