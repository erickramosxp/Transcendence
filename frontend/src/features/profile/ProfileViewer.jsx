import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system/primitives/Tabs'
import Loading from '@/design-system/components/Loading';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'

import { MediaGrid } from '@/features/profile/components/MediaGrid'
import { ProfilePostList } from './components/ProfilePostList';
import { LikedPostList } from './components/LikedPostList';

import { useAuth } from '@/app/providers/AuthProvider';
import { getUserInfo } from './services/profileService';

export function ProfileViewer() {

  const [loadHeader, setLoadHeader] = useState(true);
  const [notFounded, setNotFounded] = useState(false);
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();
  const { username } = useParams();

  const profileUsername = username ?? user.username;

  useEffect(() => {

		const getProfileInfo = async () => {

			try {
				const resp = await getUserInfo(profileUsername);
				setUserData(resp);
				setNotFounded(false);
			} catch (err) {
				console.log(err);
        setNotFounded(true);
				toast.error('Fail to get profile info');
			} finally {
        setLoadHeader(false);
			}
		}

		getProfileInfo();
	},[username]);

  const changeFields = (data) => {
    setUserData(data);
  }


  	if (loadHeader) {
		return (
      <Loading size='lg' full={true}/>
		);
	}

  if (notFounded){

    return (
      <div className='flex flex-1 items-center justify-center h-full'>
        <p className='text-muted-foreground text-3xl text-center'>
          Perfil não encontrado
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-background min-h-screen`}>
      <ProfileHeader userData={userData} changeFields={changeFields}/>
      <div className='max-w-4xl mx-auto px-4 pb-10'>
        <Tabs defaultValue="posts" className={`max-w-4xl`} >
          <TabsList className='mb-4'>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="likes">Curtidas</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <ProfilePostList username={userData.username} />
          </TabsContent>
          <TabsContent value="media">
            <MediaGrid  username={userData.username}/>
          </TabsContent>
          <TabsContent value="likes">
            <LikedPostList username={userData.username}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
