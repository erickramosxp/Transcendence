import React, { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { ProfileHeader } from '@/features/profile/components/ui/ProfileHeader'

import { MediaGrid } from '@/features/profile/components/ui/MediaGrid'
import { ProfilePostList } from '@/features/profile/components/lists/ProfilePostList';
import { LikedPostList } from '@/features/profile/components/lists/LikedPostList';

import { useAuth } from '@/app/providers/AuthProvider';
import { getUserInfo, updateProfileAvatar } from '@/features/profile/services/profileService';
import { ProfileContext } from '@/features/profile/context/ProfileContext';

import { useTranslation } from 'react-i18next';

import { Tabs, TabsList, TabsTrigger, TabsContent, Loading } from '@/design-system'


export function ProfileViewer() {

  const topRef = useRef(null);
  const [loadHeader, setLoadHeader] = useState(true);
  const [notFounded, setNotFounded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const { user } = useAuth();
  const { username } = useParams();
  const { t } = useTranslation('profile');

  const profileUsername = username ?? user.username;

  useLayoutEffect(() => {
    setActiveTab('posts');
    topRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [profileUsername]);

  useEffect(() => {

    const getProfileInfo = async () => {

      setLoadHeader(true);

      try {
        const resp = await getUserInfo(profileUsername);
        setUserData(resp);
        setNotFounded(false);
      } catch (err) {
        setNotFounded(true);
        toast.error(t('postList.error'));
      } finally {
        setLoadHeader(false);
      }
    }

    getProfileInfo();
  }, [profileUsername]);

  const changeFields = (data) => {

    setUserData((prev) => ({
      ...prev,
      ...data
    }));
  }

  const changeFollowCount = (type) => {

    // type = follow (+1) || type = unfollow (-1)
    setUserData((prev) => ({
      ...prev,
      followers:
        type === 'follow'
          ? prev.followers + 1
          : prev.followers - 1,
    }))
  }

  const updateAvatar = async (image) => {

    try {

      const formData = new FormData();
      formData.append("file", image);

      const resp = await updateProfileAvatar(formData);
      changeFields({avatarUrl: resp.avatarUrl});
      toast.success(t("common:success.avatar.updated"));
    } catch (err) {
      toast.error(t("common:errors.avatar.uploadFailed"));
    }
  }


  if (loadHeader) {
    return (
      <Loading size='lg' full={true} />
    );
  }

  if (notFounded) {

    return (
      <div className='flex flex-1 items-center justify-center h-full'>
        <p className='text-muted-foreground text-3xl text-center'>
          {t('viewer.notFounded')}
        </p>
      </div>
    )
  }

  return (
    <ProfileContext.Provider
      value={{ userData, setUserData, changeFields, changeFollowCount, updateAvatar }}
    >
      <div className={`bg-background min-h-screen`}>
        <div ref={topRef} />
        <ProfileHeader />
        <div className='max-w-4xl mx-auto px-3 sm:px-4 pb-10'>
          <Tabs value={activeTab} onValueChange={setActiveTab} className={`max-w-4xl`} >
            <TabsList className='mb-4'>
              <TabsTrigger value="posts">{t('viewer.posts')}</TabsTrigger>
              <TabsTrigger value="media">{t('viewer.media')}</TabsTrigger>
              <TabsTrigger value="likes">{t('viewer.likes')}</TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <ProfilePostList username={userData.username} />
            </TabsContent>
            <TabsContent value="media">
              <MediaGrid username={userData.username} />
            </TabsContent>
            <TabsContent value="likes">
              <LikedPostList username={userData.username} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProfileContext.Provider>
  )
}
