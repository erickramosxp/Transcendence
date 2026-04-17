import React from 'react'
import { Input, Button } from '@/design-system'
import { Search } from 'lucide-react'

const FriendSuggestions = () => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-1.5'>
        <Input icon={<Search size={20} />} id='discovery' name='discovery' />
        <Button className='cursor-pointer'>Buscar</Button>
      </div>
    </div>
  )
}

export default FriendSuggestions
