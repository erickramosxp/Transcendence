import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/design-system';
import { UserRoundPlus, UserRoundX, Users, UserMinus } from 'lucide-react'
import { useFriendshipActions } from '../hooks/useFriendshipActions';
import { FRIENDSHIP_STATUS } from '@/shared/constants/friendship';
import { useTranslation } from 'react-i18next';

const FriendshipButton = ({ initialStatus, friendshipId, targetUserId, variant = 'dropdown', onSuccess }) => {
    const { t } = useTranslation('friends');
    const [status, setStatus] = useState(initialStatus);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    const actions = useFriendshipActions({
        friendshipId,
        targetUserId,
        setStatus,
        setOpen,
        setLoading,
        onSuccess
    });


    if (status === FRIENDSHIP_STATUS.NONE) {
        return (
            <Button onClick={actions.sendRequest} title="Adicionar amigo" aria-label="Adicionar amigo" disabled={loading}>
                <UserRoundPlus />
                <span className="hidden sm:inline">
                    {t('buttons.add')}
                </span>
            </Button>
        );
    }

    if (status === FRIENDSHIP_STATUS.PENDING_SENT) {
        return (
            <Button onClick={actions.cancelRequest} variant={"destructive"} disabled={loading}>
                <UserRoundX />
                <span className="hidden sm:inline">
                    {t('buttons.cancel')}
                </span>
            </Button>
        );
    }

    if (status === FRIENDSHIP_STATUS.ACCEPTED) {
        return (
            <Button onClick={actions.unfriend} variant={"outline"} disabled={loading}>
                <UserMinus />
                <span className="hidden sm:inline">
                    {t('buttons.undoFriendship')}
                </span>
            </Button>
        );
    }

    if (status === FRIENDSHIP_STATUS.PENDING_RECEIVED) {


        if (variant === 'inline') {
            return (
                <div className="flex items-center gap-1.5">
                    <Button
                        onClick={actions.accept}
                        size='sm'
                    >
                        {t('buttons.accept')}
                    </Button>
                    <Button
                        onClick={actions.reject}
                        variant='destructive'
                        size='sm'
                    >
                        {t('buttons.reject')}
                    </Button>
                </div>
            );
        }

        return (
            <div className="relative inline-block" ref={dropdownRef}>
                <Button onClick={() => setOpen((prev) => !prev)} variant={"primary"} className="max-w-full truncate" disabled={loading}>
                    <Users />
                    <span className="hidden sm:inline">
                        {t('buttons.reply')}
                    </span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>

                {open && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-border bg-card shadow-lg" >
                        <div className="py-1">
                            <Button onClick={actions.accept} variant={"ghost"} size={"full"} disabled={loading}>
                                {t('buttons.acceptInvite')}
                            </Button>
                            <Button onClick={actions.reject} variant={"ghost"} size={"full"} disabled={loading}>
                                {t('buttons.rejectInvite')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default FriendshipButton;