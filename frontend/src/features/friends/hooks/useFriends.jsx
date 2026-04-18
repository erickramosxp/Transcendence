import React, { useCallback, useEffect, useState } from 'react'
import { getFriendPendingRequests, getListFriends } from '../service/friendService';
import { toast } from 'react-toastify'

export const useFriends = () => {

    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);

    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(0);
    const [hasMoreFriends, setHasMoreFriends] = useState(true);


    const fetchFriends = useCallback(async (currentPage, searchQuery = "", isNewSearch = false) => {

        try {

            if(isNewSearch) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const resp = await getListFriends(currentPage, 8, searchQuery);
            const newData = resp.data.items;
            const backendHasMore = resp.data.hasMore;

            if (isNewSearch) {
                setFriends(newData);
            } else {
                setFriends(prev => [...prev, ...newData]);
            }

            setHasMoreFriends(backendHasMore);

        } catch (error) {
            toast.error("Erro ao carregar amigos");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);


    useEffect(() => {

        const fetchData = async () => {

            try {
                const requestsResp = await getFriendPendingRequests();
                setRequests(requestsResp.data);
            } catch {
                toast.error("Erro ao carregar solicitações");
            }
        }

        fetchData();
        fetchFriends(0, "", true);

    }, [fetchFriends]);

    const removeRequest = (friendshipId) => {
        setRequests((prev) =>
            prev.filter((request) => request.friendshipId !== friendshipId)
        );
    }

    const removeFriend = (friendshipId) => {
        setFriends((prev) =>
            prev.filter((friend) => friend.friendshipId !== friendshipId)
        );
    }

    const acceptRequest = (acceptedUser) => {
        setRequests((prev) =>
            prev.filter(
                (request) => request.friendshipId !== acceptedUser.friendshipId
            )
        );

        setFriends((prev) => [acceptedUser, ...prev]);
    };

    return {
        friends,
        requests,
        loading,
        loadingMore,
        hasMoreFriends,
        fetchFriends,
        removeRequest,
        removeFriend,
        acceptRequest
    }
}

