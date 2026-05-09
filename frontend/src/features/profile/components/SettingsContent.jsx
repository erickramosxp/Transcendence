import React, { useState } from 'react'
import {
    Tabs,
    TabsContent,
    TabsTrigger,
    TabsList,
    Input,
    Label,
    Button,
    Separator,
    LanguageSwitcher,
    ThemeToggle,
    Loading
} from '@/design-system'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify'
import { deleteMyProfileAvatar } from '../services/profileService';
import { useProfile } from '../context/ProfileContext';

export const SettingsContent = () => {

    const { t } = useTranslation('settings');

    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const { userData, changeFields } = useProfile();

    const handleSettingsSubmit = (e) => {

        e.preventDefault();
        alert(t('messages.notImplemented'));
    }

    const removeProfileAvatar = async () => {

        setLoading(true);
        try {
            await deleteMyProfileAvatar();
            changeFields({ avatarUrl: null });
            toast.success(t('profilePhoto.deleteSuccess'));
        } catch (error) {
            toast.error(t('profilePhoto.deleteError'));
            console.log(error);
        } finally {
            setLoading(false);
        }

    }

    return (
        <>
            {loading &&
                <Loading className='backdrop-blur-sm z-50' full={true} />}
            <Tabs defaultValue="account" >
                <TabsList className="rounded-none">
                    <TabsTrigger value="account">{t('tabs.account')}</TabsTrigger>
                    <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
                    <TabsTrigger value="appearance">{t('tabs.appearance')}</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <div className='flex flex-col gap-2 text-center p-5'>
                        <div className='flex items-center gap-5 pb-5'>
                            <p>{t('account.removeProfilePhoto')}</p>
                            <Button disabled={userData.avatarUrl ? false : true} onClick={removeProfileAvatar} size='sm' variant='destructive'>{t('account.remove')}</Button>
                        </div>
                        <Separator />
                        <div>
                            <Button variant="destructive" onClick={logout}>{t('account.logout')}</Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="security">
                    <div className='p-4 text-center'>
                        <h2>{t('security.title')}</h2>
                        <form className='flex flex-col gap-3' onSubmit={handleSettingsSubmit}>

                            <div>
                                <Label htmlFor="">{t('security.currentPassword')}</Label>
                                <Input type="text" />
                            </div>
                            <div>
                                <Label htmlFor="">{t('security.newPassword')}</Label>
                                <Input type="text" />
                            </div>
                            <div>
                                <Label htmlFor="">{t('security.confirmPassword')}</Label>
                                <Input type="text" />
                            </div>
                            <div>
                                <Button type='submit'>{t('security.submit')}</Button>
                            </div>
                        </form>
                    </div>
                </TabsContent>
                <TabsContent value="appearance" className="overflow-visible">
                    <div className='flex flex-col gap-4 p-4'>
                        <div className='flex gap-3'>
                            <Label>{t('appearance.theme')}</Label>
                            <ThemeToggle />
                        </div>
                        <Separator />
                        <div className='flex gap-3'>
                            <Label>{t('appearance.language')}</Label>
                            <LanguageSwitcher activeToastNotification={true} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

        </>
    )
}
