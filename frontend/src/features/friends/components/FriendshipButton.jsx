import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/design-system';
import { UserRoundPlus, UserRoundX, Users, UserMinus } from 'lucide-react'

const baseButtonClass =
    'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors';

const buttonVariants = {
    primary: `${baseButtonClass} bg-primary text-primary-foreground hover:bg-primary/90`,
    secondary: `${baseButtonClass} bg-accent text-foreground hover:bg-accent/80`,
    outline: `${baseButtonClass} border border-border bg-card text-foreground hover:bg-accent`,
    dangerGhost: `${baseButtonClass} border border-border bg-card text-foreground hover:bg-accent`,
    successItem: 'block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50',
    dangerItem: 'block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50',
};

const FriendshipButton = ({ initialStatus, friendshipId, targetUserId }) => {
    const [status, setStatus] = useState(initialStatus);
    const [open, setOpen] = useState(false);
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

    const actions = {
        sendRequest: async () => setStatus('PENDING_SENT'),
        cancelRequest: async () => setStatus('NONE'),
        accept: async () => {
            setStatus('ACCEPTED');
            setOpen(false);
        },
        reject: async () => {
            setStatus('NONE');
            setOpen(false);
        },
        unfriend: async () => setStatus('NONE'),
    };


    if (status === 'NONE') {
        return (
            <Button onClick={actions.sendRequest} title="Adicionar amigo" aria-label="Adicionar amigo">
                <UserRoundPlus />
                <span className="hidden sm:inline">
                    Adicionar
                </span>
            </Button>
        );
    }

    if (status === 'PENDING_SENT') {
        return (
            <Button onClick={actions.cancelRequest} variant={"destructive"}>
                <UserRoundX />
                <span className="hidden sm:inline">
                    Cancelar
                </span>
            </Button>
        );
    }

    if (status === 'ACCEPTED') {
        return (
            <Button onClick={actions.unfriend} variant={"outline"}>
                <UserMinus />
                <span className="hidden sm:inline">
                    Desfazer amizade
                </span>
            </Button>
        );
    }

    if (status === 'PENDING_RECEIVED') {
        return (
            <div className="relative inline-block" ref={dropdownRef}>
                <Button onClick={() => setOpen((prev) => !prev)} variant={"primary"} className="max-w-full truncate">
                    <Users />
                    <span className="hidden sm:inline">
                        Responder
                    </span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>

                {open && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-border bg-card shadow-lg">
                        <div className="py-1">
                            <Button onClick={actions.accept} variant={"ghost"} size={"full"}>
                                Aceitar convite
                            </Button>
                            <Button onClick={actions.reject} variant={"ghost"} size={"full"}>
                                Recusar convite
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