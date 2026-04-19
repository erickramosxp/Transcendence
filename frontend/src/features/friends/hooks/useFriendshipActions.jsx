import React from "react";

import { acceptFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest } from '../service/friendService';
import { toast } from 'react-toastify'
import { FRIENDSHIP_STATUS } from "@/shared/constants/friendship";
import { useTranslation } from "react-i18next";

export function useFriendshipActions({ friendshipId, targetUserId, setStatus, setOpen, setLoading, onSuccess, setCurrentFriendshipId }) {

    const { t } = useTranslation('friends');

    return {
        sendRequest: async () => {
            setStatus(FRIENDSHIP_STATUS.PENDING_SENT)

            setLoading(true);
            try {
                const resp = await sendFriendRequest(targetUserId);
                setCurrentFriendshipId(resp.data.friendshipId);
                toast.success(t('toast.requestSentSuccess'));
            } catch (err) {
                toast.error(t('toast.requestSentError'));
                setStatus(FRIENDSHIP_STATUS.NONE);
            } finally {
                setLoading(false);
            }
        },
        cancelRequest: async () => {
            setStatus(FRIENDSHIP_STATUS.NONE)
            setLoading(true);
            try {
                await removeFriend(friendshipId);
                toast.success(t('toast.requestCanceledSuccess'));
            } catch (err) {
                toast.error(t('toast.requestCanceledError'));
                setStatus(FRIENDSHIP_STATUS.PENDING_SENT)
            } finally {
                setLoading(false);
            }
        },
        accept: async () => {
            setStatus(FRIENDSHIP_STATUS.ACCEPTED);
            setLoading(true);
            try {
                await acceptFriendRequest(friendshipId);
                toast.success(t('toast.requestAcceptedSuccess'));
                onSuccess?.("accept", {
                    friendshipId,
                    friendId: targetUserId
                });
            } catch (err) {
                toast.error(t('toast.requestAcceptedError'));
                setStatus(FRIENDSHIP_STATUS.PENDING_RECEIVED);
                return;
            } finally {
                setLoading(false);
            }
            setOpen(false);
        },
        reject: async () => {
            setStatus(FRIENDSHIP_STATUS.NONE);
            setLoading(true);
            try {
                await rejectFriendRequest(friendshipId);
                toast.success(t('toast.requestRejectedSuccess'));
                onSuccess?.("reject", {
                    friendshipId
                });
            } catch (err) {
                toast.error(t('toast.requestRejectedError'));
                setStatus(FRIENDSHIP_STATUS.PENDING_RECEIVED);
                return;
            } finally {
                setLoading(false);
            }
            setOpen(false);
        },
        unfriend: async () => {
            setStatus(FRIENDSHIP_STATUS.NONE)
            setLoading(true);
            try {
                await removeFriend(friendshipId);
                toast.success(t('toast.friendRemovedSuccess'));
                onSuccess?.("unfriend", {
                    friendshipId
                });
            } catch (err) {
                toast.error(t('toast.friendRemovedError'));
                setStatus(FRIENDSHIP_STATUS.ACCEPTED);
                return;
            } finally {
                setLoading(false);
            }
        },
    };
}