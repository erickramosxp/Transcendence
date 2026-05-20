import React, { useState } from 'react'
import { Input, Button } from '@/design-system'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next';
import { LIMITS } from '@/shared/validation/limits';

const FriendSuggestions = () => {

  const { t } = useTranslation('friends');
  const [search, setSearch] = useState('');

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-1.5'>
        <Input
          icon={<Search size={20} />}
          id='discovery'
          name='discovery'
          value={search}
          maxLength={LIMITS.friendSearchMax}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search.placeholder')}
        />
        <Button className='cursor-pointer'>{t('search.button')}</Button>
      </div>
    </div>
  )
}

export default FriendSuggestions
