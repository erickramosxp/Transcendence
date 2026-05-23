import React from 'react'

import { MapPin, Globe, RotateCcw } from 'lucide-react';
import { Button, Input, Label, Select } from '@/design-system';
import { LIMITS } from '@/shared/validation/limits';
import { useTranslation } from 'react-i18next';

const SearchFilters = ({
    locationFilter,
    setLocationFilter,
    languageFilter,
    setLanguageFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    onClear
}) => {

    const { t } = useTranslation('friends');

    const inputContainerClass = "flex flex-col gap-1 w-full";

    return (
        <div className='flex flex-col gap-4 ds-surface-glass border border-border/60 bg-card/45 rounded-sm p-4'>
            <h3 className='text-xs font-bold text-foreground/80 uppercase tracking-wider'>
                {t('discovery.filters.title')}
                {/* Filtros avançados */}
            </h3>
            <div className="flex flex-col md:flex-row gap-3 items-start">

                <div className={inputContainerClass}>
                    <Label htmlFor="location-filter">
                        {t('discovery.filters.location')}
                    </Label>
                    <Input
                        id="location-filter"
                        icon={<MapPin size={16} />}
                        type="text"
                        value={locationFilter}
                        maxLength={LIMITS.friendSearchMax}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder={t('discovery.filters.locationPlaceholder')}
                    />
                </div>
                <div className={inputContainerClass}>
                    <Label htmlFor="language-filter">
                        {t('discovery.filters.language')}
                    </Label>
                    <Select
                        id="language-filter"
                        icon={<Globe size={16} />}
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                    >
                        <option value="all">{t('discovery.filters.allLanguages')}</option>
                        <option value="pt-BR">{t('discovery.languages.pt-BR')}</option>
                        <option value="en-US">{t('discovery.languages.en-US')}</option>
                        <option value="es-ES">{t('discovery.languages.es-ES')}</option>
                    </Select>
                </div>
                <div className={inputContainerClass}>
                    <Label htmlFor="sort-by">
                        {t('discovery.filters.sortBy')}
                    </Label>
                    <Select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="createdAt">{t('discovery.filters.sortRelevance')}</option>
                        <option value="name">{t('discovery.filters.sortName')}</option>
                        <option value="mutualFriends">{t('discovery.filters.sortMutual')}</option>
                    </Select>
                </div>
                <div className={inputContainerClass}>
                    <Label htmlFor="sort-dir">
                        {t('discovery.filters.sortDirection')}
                    </Label>
                    <div className="flex gap-2 w-full justify-between">
                        <Select
                            id="sort-dir"
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value)}
                        >
                            <option value="desc">{t('discovery.filters.sortDesc')}</option>
                            <option value="asc">{t('discovery.filters.sortAsc')}</option>
                        </Select>
                        <Button
                            onClick={onClear}
                            type="button"
                            title={t('discovery.filters.clear')}
                        >
                            <RotateCcw size={16} />
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default SearchFilters
