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

const mockMedia = [
  { id: 1, url: "https://images.unsplash.com/photo-1504805572947-34fad45aed93", alt: "do something great" },
  { id: 2, url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", alt: "pessoas trabalhando" },
  { id: 3, url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", alt: "código no monitor" },
  { id: 4, url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", alt: "notebook aberto" },
  { id: 5, url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd", alt: "teclado mecânico" },
  { id: 6, url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", alt: "matrix code" },
  { id: 7, url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1", alt: "laptop cinza" },
];

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
      <ProfileHeader userData={userData}/>
      <div className='max-w-4xl mx-auto px-4 pb-10'>
        <Tabs defaultValue="posts" className={`max-w-4xl`} >
          <TabsList className='mb-4'>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="likes">Curtidas</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <ProfilePostList userId={userData.id} />
          </TabsContent>
          <TabsContent value="media">
            <MediaGrid  items={mockMedia}/>
          </TabsContent>
          <TabsContent value="likes">
            <LikedPostList userId={userData.id}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
