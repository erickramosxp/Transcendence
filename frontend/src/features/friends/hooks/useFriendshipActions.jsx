import React from "react";

import { acceptFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest } from '../service/friendService';
import { toast } from 'react-toastify'
import { FRIENDSHIP_STATUS } from "@/shared/constants/friendship";

export function useFriendshipActions({ friendshipId, targetUserId, setStatus, setOpen, setLoading, onSuccess }) {


    return {
        sendRequest: async () => {
            setStatus(FRIENDSHIP_STATUS.PENDING_SENT)

            setLoading(true);
            try {
                await sendFriendRequest(targetUserId);
                toast.success("Pedido de amizade enviado");
            } catch (err) {
                toast.error("Erro ao enviar o pedido de amizade");
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
                toast.success("Pedido de amizade cancelado");
            } catch (err) {
                toast.error("Erro ao cancelar o pedido de amizade");
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
                toast.success("Pedido de amizade aceito");
                onSuccess?.("accept", {
                    friendshipId,
                    friendId: targetUserId
                });
            } catch (err) {
                toast.error("Erro ao aceitar o pedido de amizade");
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
                toast.success("Pedido de amizade recusado");
                onSuccess?.("reject", {
                    friendshipId
                });
            } catch (err) {
                toast.error("Erro ao recusar o pedido de amizade");
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
                toast.success("Amizade removida");
                onSuccess?.("unfriend", {
                    friendshipId
                });
            } catch (err) {
                toast.error("Erro ao remover a amizade");
                setStatus(FRIENDSHIP_STATUS.ACCEPTED);
                return;
            } finally {
                setLoading(false);
            }
        },
    };
}