import React from 'react'

import { Card, CardContent, Avatar } from '@/design-system';
import FriendshipButton from '../FriendshipButton';
import { MapPin, Globe} from 'lucide-react';
import { FRIENDSHIP_STATUS } from '@/shared/constants/friendship';
import { useTranslation } from 'react-i18next';


const DetailedFriendCard = ({ user }) => {

    const { t } = useTranslation('friends');

    const friendshipState = user?.relationStatus || FRIENDSHIP_STATUS.NONE;
    const mutualCount = user?.mutualFriendsCount || 0;

    const LANGUAGE_LABELS = {
        'pt-BR': t('discovery.languages.pt-BR'),
        'en-US': t('discovery.languages.en-US'),
        'es-ES': t('discovery.languages.es-ES')
    };

    const displayLanguages = () => {
        if (!user?.language) return t('discovery.card.notInformed');
        return LANGUAGE_LABELS[user.language] || user.language;
    };

    return (
        <Card className="transition-all">
            <CardContent className="
            p-4
            flex flex-col gap-3
            lg:flex-row lg:items-center lg:gap-6
    ">

                {/* Perfil */}
                <div className="
                flex gap-3 items-center
                min-w-0
                flex-1
                lg:min-w-70
        ">
                    <Avatar
                        src={user?.avatarUrl}
                        username={user?.username}
                        name={user?.name}
                        size="lg"
                        className="shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <h4 className="text-base font-medium truncate">
                            {user?.name}
                        </h4>

                        <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                        </p>

                        <p
                            className="text-sm line-clamp-1"
                            title={user?.bio}
                        >
                            {user.bio}
                        </p>
                    </div>
                </div>

                {/* Infos */}
                <div className="
                    flex flex-row gap-3
                    lg:flex-col lg:w-auto
                    text-xs text-muted-foreground
                    shrink-0
                    lg:min-w-27
                    justify-center
        ">
                    <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{user?.location ?? t('discovery.card.notInformed')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Globe size={14} />
                        <span>{displayLanguages()}</span>
                    </div>
                </div>

                {/* Amigos */}
                <div className="
                text-xs text-muted-foreground
                lg:flex-none
                lg:min-w-35
                lg:text-center
                lg:whitespace-nowrap
                text-center
        ">
                    {mutualCount > 0 ?
                        `${mutualCount > 1 ? 
                            t('discovery.card.mutualFriends_plural', { count: mutualCount })
                            : t('discovery.card.mutualFriends', { count: mutualCount })}`
                        : t('discovery.card.noMutualFriends')
                        }
                </div>

                {/* Botão */}
                <div className="
                w-full
                flex justify-center
                lg:w-auto
                lg:justify-end
                ">
                    <FriendshipButton
                        initialStatus={friendshipState}
                        friendshipId={user?.friendshipId ?? null}
                        targetUserId={user?.id ?? null}
                        onSuccess={() => { }}
                        variant='inline'
                    />
                </div>

            </CardContent>
        </Card>
    )
}

export default DetailedFriendCard
