
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system';
import FriendsList from './components/FriendsList';
import FriendRequests from './components/FriendRequests';
import FriendDiscovery from './components/discovery/FriendDiscovery';
import { useFriends } from './hooks/useFriends';
import { FriendsProvider } from './Context/FriendsContext';
import { useTranslation } from 'react-i18next';

export const FriendsView = () => {

    const { t } = useTranslation('friends');
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const initialTab =
        tabFromUrl === 'requests' || tabFromUrl === 'discover'
            ? tabFromUrl
            : 'friends';
    const [tab, setTab] = useState(initialTab);

    const friendsData = useFriends();

    useEffect(() => {
        const urlTab = searchParams.get('tab');
        if (urlTab === 'requests' || urlTab === 'discover' || urlTab === 'friends') {
            setTab(urlTab);
        }
    }, [searchParams]);

    const handleTabChange = (value) => {
        setTab(value);
        if (value === 'friends') {
            setSearchParams({});
        } else {
            setSearchParams({ tab: value });
        }
    };

    return (
        <div className='max-w-4xl mx-auto px-3 sm:px-4 pb-10 pt-5 sm:pt-10'>
            <header className="ds-chat-list-head mb-3">
				<h2 className="ds-notification-title">{t("title")}</h2>
			</header>
            <FriendsProvider value={friendsData} >
                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList className='mb-3'>
                        <TabsTrigger value="friends">{t('tabs.friends')}</TabsTrigger>
                        <TabsTrigger value="requests">{t('tabs.requests')}</TabsTrigger>
                        <TabsTrigger value="discover">{t('tabs.discover')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="friends">
                        <FriendsList />
                    </TabsContent>
                    <TabsContent value="requests">
                        <FriendRequests />
                    </TabsContent>
                    <TabsContent value="discover">
                        <FriendDiscovery />
                    </TabsContent>
                </Tabs>
            </FriendsProvider>

        </div>
    )
}
