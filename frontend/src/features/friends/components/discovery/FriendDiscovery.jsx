import React, { useState } from 'react'
import SearchInput from './SearchInput';
import SearchFilters from './SearchFilters';
import FriendDiscoveryList from './FriendDiscoveryList';
import { useFriendSearch } from '../../hooks/useFriendSearch';

const FriendDiscovery = () => {

  const {
    currentPage,
    usersList,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handleClearFilters,
    locationFilter,
    setLocationFilter,
    languageFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    setLanguageFilter,
    hasMore,
    isLoading,
    handleLoadMore,
    isLoadingMore,
    handleFriendshipAction
  } = useFriendSearch();

  return (
    <div className='flex flex-col gap-4'>

      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSubmit={handleSearchSubmit}
      />
      <SearchFilters
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onClear={handleClearFilters}
      />
      <FriendDiscoveryList
        users={usersList}
        onAction={handleFriendshipAction}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        isLoadingFriends={isLoading}
        page={currentPage}
      />
    </div>
  )
}

export default FriendDiscovery
