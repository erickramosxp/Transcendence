
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system';
import FriendsList from './components/FriendsList';
import FriendRequests from './components/FriendRequests';
import FriendSuggestions from './components/FriendSuggestions';

export const FriendsView = () => {

    const [tab, setTab] = useState("friends");

    return (
        <div>
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
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

        </div>
    )
}
