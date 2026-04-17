import React, { useEffect, useState } from 'react'
import { getFriendPendingRequests, getListFriends } from '../service/friendService';
import { toast } from 'react-toastify'

export const useFriends = () => {

    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);


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


    useEffect(() => {

        const fetchData = async () => {


            setLoading(true);
            try {
                const [friendsResp, requestsResp] = await Promise.all([
                    getListFriends(),
                    getFriendPendingRequests()
                ]);

                setFriends(friendsResp.data);
                setRequests(requestsResp.data);
            } catch {

                toast.error("Erro ao carregar dados de amizade");
            } finally {
                setLoading(false);
            }
        }
        fetchData();

    }, []);

    return {
        friends,
        requests,
        loading,
        removeRequest,
        removeFriend,
        acceptRequest
    }
}

