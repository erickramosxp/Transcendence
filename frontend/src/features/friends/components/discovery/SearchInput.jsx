import React from 'react'
import { Search } from 'lucide-react';
import { Input, Button } from '@/design-system'
import { LIMITS } from '@/shared/validation/limits';
import { useTranslation } from 'react-i18next';

const SearchInput = ({ value, onChange, onSubmit }) => {

    const { t } = useTranslation('friends');

    return (
        <form onSubmit={onSubmit} className="flex gap-2 w-full">
            <div className='relative flex-1'>
                <Input
                    icon={<Search size={20} />}
                    id="q-search"
                    name="q"
                    value={value}
                    maxLength={LIMITS.friendSearchMax}
                    onChange={onChange}
                    placeholder={t('discovery.search.placeholder')}
                    className="w-full pr-4"
                />
            </div>
            <Button type="submit" className='cursor-pointer'>{t('discovery.search.button')}</Button>
        </form>
    )
}

export default SearchInput
