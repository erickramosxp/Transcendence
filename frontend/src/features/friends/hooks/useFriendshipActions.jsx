import React from "react";

import { acceptFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest } from '../service/friendService';
import { toast } from 'react-toastify'

export function useFriendshipActions({ friendshipId, targetUserId, setStatus, setOpen, setLoading, onSuccess }) {


    return {
        sendRequest: async () => {
            setStatus('PENDING_SENT')

            setLoading(true);
            try {
                await sendFriendRequest(targetUserId);
                toast.success("Pedido de amizade enviado");
            } catch (err) {
                toast.error("Erro ao enviar o pedido de amizade");
                setStatus('NONE');
            } finally {
                setLoading(false);
            }
        },
        cancelRequest: async () => {
            setStatus('NONE')
            setLoading(true);
            try {
                await removeFriend(friendshipId);
                toast.success("Pedido de amizade cancelado");
            } catch (err) {
                toast.error("Erro ao cancelar o pedido de amizade");
                setStatus('PENDING_SENT')
            } finally {
                setLoading(false);
            }
        },
        accept: async () => {
            setStatus('ACCEPTED');
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
                setStatus('PENDING_RECEIVED');
                return;
            } finally {
                setLoading(false);
            }
            setOpen(false);
        },
        reject: async () => {
            setStatus('NONE');
            setLoading(true);
            try {
                await rejectFriendRequest(friendshipId);
                toast.success("Pedido de amizade recusado");
                onSuccess?.("reject", {
                    friendshipId
                });
            } catch (err) {
                toast.error("Erro ao recusar o pedido de amizade");
                setStatus('PENDING_RECEIVED');
                return;
            } finally {
                setLoading(false);
            }
            setOpen(false);
        },
        unfriend: async () => {
            setStatus('NONE')
            setLoading(true);
            try {
                await removeFriend(friendshipId);
                toast.success("Amizade removida");
                onSuccess?.("unfriend", {
                    friendshipId
                });
            } catch (err) {
                toast.error("Erro ao remover a amizade");
                setStatus('ACCEPTED');
                return;
            } finally {
                setLoading(false);
            }
        },
    };
}