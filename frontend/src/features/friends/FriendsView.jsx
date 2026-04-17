
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system';
import FriendsList from './components/FriendsList';
import FriendRequests from './components/FriendRequests';
import FriendSuggestions from './components/FriendSuggestions';
import { useFriends } from './hooks/useFriends';
import { FriendsProvider } from './Context/FriendsContext';

export const FriendsView = () => {

    const [tab, setTab] = useState("friends");

    const friendsData = useFriends();

    return (
        <div className='max-w-4xl mx-auto px-3 sm:px-4 pb-10 pt-5 sm:pt-10'>
            <div className='mb-3'>
                <h1>Amigos</h1>
            </div>
            <FriendsProvider value={friendsData} >
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className='mb-3'>
                        <TabsTrigger value="friends">Amigos</TabsTrigger>
                        <TabsTrigger value="requests">Pedidos</TabsTrigger>
                        <TabsTrigger value="discover">Descobrir</TabsTrigger>
                    </TabsList>
                    <TabsContent value="friends">
                        <FriendsList />
                    </TabsContent>
                    <TabsContent value="requests">
                        <FriendRequests />
                    </TabsContent>
                    <TabsContent value="discover">
                        <FriendSuggestions />
                    </TabsContent>
                </Tabs>
            </FriendsProvider>

        </div>
    )
}
