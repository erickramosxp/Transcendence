import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Loading, Input, Button, Scroll } from "@/design-system";
import { Search } from 'lucide-react'
import { useTranslation } from "react-i18next";
import { LIMITS } from "@/shared/validation/limits";

export const PaginatedSearchList = ({
    data,
    loading,
    loadingMore,
    hasMore,
    onFetch,
    renderItem,
    placeholder,
    emptyMessage ,
    notFoundMessage ,
    showSearch = true
}) => {
    
    const { t } = useTranslation('friends');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const endListRef = useRef(null);

    const debouncedSearch = useDebounce(search, 650);
    const clampedSearch = debouncedSearch.slice(0, LIMITS.friendSearchMax);

    useEffect(() => {
        setPage(0);
        onFetch(0, clampedSearch, true);
    }, [clampedSearch, onFetch]); 



    useEffect(() => {
        if (page > 0 && data?.length > 0) {
            const scrollContainer = endListRef.current?.closest('.max-h-\\[500px\\]');
            if (scrollContainer) {
                scrollContainer.scrollBy({ top: 150, behavior: 'smooth' });
            }
        }
    }, [data, page]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        onFetch(nextPage, clampedSearch, false);
    };

    return (
        <div className='flex flex-col gap-4'>
            {showSearch && (
                <div className='flex items-center gap-1.5'>
                    <Input
                        id='search'
                        icon={<Search size={20} />}
                        value={search}
                        maxLength={LIMITS.friendSearchMax}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                    />
                </div>
            )}

            {loading ? (
                <div className='flex items-center justify-center min-h-80'>
                    <Loading />
                </div>
            ) : (
                <>
                    <Scroll className="max-h-[500px]">
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5'>
                            {data && data?.length > 0 ? (
                                data.map((item, index) => renderItem(item, index))
                            ) : (
                                <p className="col-span-full text-center text-muted-foreground">
                                    {clampedSearch ? notFoundMessage : emptyMessage}
                                </p>
                            )}
                            <div ref={endListRef}></div>
                        </div>
                    </Scroll>

                    {hasMore && data?.length > 0 && (
                        <div className="flex justify-center mt-4">
                            <Button onClick={handleLoadMore} disabled={loadingMore} className='cursor-pointer'>
                                {loadingMore ? t('search.loadingMore') :  t('search.loadMore')}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};