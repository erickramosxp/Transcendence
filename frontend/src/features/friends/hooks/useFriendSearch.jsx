
import { useState } from "react";
import { toast } from "react-toastify";
import { searchFriends } from "../service/friendService";
import { FRIENDSHIP_STATUS } from "@/shared/constants/friendship";
import { useTranslation } from "react-i18next";

export const useFriendSearch = () => {

    const [usersList, setUsersList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    const [languageFilter, setLanguageFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const PAGE_SIZE = 6;

    const { t } = useTranslation('friends')

    const handleSearchSubmit = async (e) => {

        e.preventDefault();
        setCurrentPage(0);
        setIsLoading(true);

        try {
            const resp = await searchFriends(0, PAGE_SIZE, searchTerm, locationFilter, languageFilter, sortBy, sortDir);
            setUsersList(resp.items);
            setHasMore(resp.hasMore);
        } catch (error) {
            toast.error(t('toast.searchFailed'))
        } finally {
            setIsLoading(false);
        }

    }

    const handleLoadMore = async () => {
        setIsLoadingMore(true);

        const nextPage = currentPage + 1;

        try {
            const resp = await searchFriends(nextPage, PAGE_SIZE, searchTerm, locationFilter, languageFilter, sortBy, sortDir);
            const users = resp.items;

            setUsersList((prevUsers) => [...prevUsers, ...users]);
            setHasMore(resp.hasMore);
            setCurrentPage(nextPage);

        } catch (error) {
            toast.error(t('toast.loadMoreFailed'))
        } finally {
            setIsLoadingMore(false);
        }
    };

const handleFriendshipAction = (action, payload) => {

    const { targetUserId, friendshipId } = payload;

    setUsersList((prevUsers) => 
        prevUsers.map((user) => {
            if (user.id === targetUserId) {
                let newStatus = user.relationStatus;
                let newFriendshipId = user.friendshipId;

                switch (action) {
                    case 'send':
                        newStatus = FRIENDSHIP_STATUS.PENDING_SENT;
                        newFriendshipId = friendshipId; // ID 
                        break;
                    case 'cancel':
                        newStatus = FRIENDSHIP_STATUS.NONE;
                        newFriendshipId = null;
                        break;
                    case 'accept':
                        newStatus = FRIENDSHIP_STATUS.ACCEPTED;
                        break;
                    case 'reject':
                    case 'unfriend':
                        newStatus = FRIENDSHIP_STATUS.NONE;
                        newFriendshipId = null;
                        break;
                    default:
                        break;
                }

                return { 
                    ...user, 
                    relationStatus: newStatus, 
                    friendshipId: newFriendshipId 
                };
            }
            return user;
        }))
    }

    const handleClearFilters = () => {
        setSearchTerm('');
        setLocationFilter('');
        setLanguageFilter('all');
        setSortBy('createdAt');
        setSortDir('desc');
        setCurrentPage(0);
        toast.info(t('toast.filtersCleared'));
    };

    return {
        currentPage,
        usersList,
        locationFilter,
        setLocationFilter,
        languageFilter,
        setLanguageFilter,
        sortBy,
        setSortBy,
        sortDir,
        setSortDir,
        searchTerm,
        setSearchTerm,
        isLoadingMore,
        hasMore,
        isLoading,
        handleLoadMore,
        handleSearchSubmit,
        handleFriendshipAction,
        handleClearFilters
    };

}