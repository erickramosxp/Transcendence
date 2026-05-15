import { Button, Loading, Separator } from '@/design-system'
import { useProfile } from '@/features/profile/context/ProfileContext'
import { deleteMyProfileAvatar } from '@/features/profile/services/profileService'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

export const AccountTab = () => {

    const { t } = useTranslation('settings')

    const { logout } = useAuth();
    const { userData, changeFields } = useProfile();

    const [loading, setLoading] = useState(false);

    const removeProfileAvatar = async () => {
        setLoading(true)

        try {
            await deleteMyProfileAvatar()

            changeFields({ avatarUrl: null })

            toast.success(t('profilePhoto.deleteSuccess'))
        } catch {
            toast.error(t('profilePhoto.deleteError'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading &&
                <Loading className='backdrop-blur-sm z-50' full={true} />}
            <div className='flex flex-col gap-2 text-center p-5'>
                <div className='flex items-center gap-5 pb-5'>
                    <p>{t('account.removeProfilePhoto')}</p>
                    <Button disabled={userData.avatarUrl ? false : true} onClick={removeProfileAvatar} size='sm' variant='destructive'>{t('account.remove')}</Button>
                </div>
                <Separator />
                <div className='flex flex-col text-start justify-start gap-2.5'>
                    <p>
                        {t('account.legalDocuments')}
                    </p>
                    <div className='text-muted-foreground'>
                        <Link to="/legal/privacy" target='_blank' rel="noopener noreferrer" className='flex items-center gap-2 hover:underline'>
                            <ExternalLink size={16} />
                            <span>
                                {t('account.privacyPolicy')}
                            </span>
                        </Link>
                        <Link to="/legal/privacy" target='_blank' rel="noopener noreferrer" className='flex items-center gap-2 hover:underline'>
                            <ExternalLink size={16} />
                            <span>
                                {t('account.termsOfService')}
                            </span>
                        </Link>
                    </div>
                </div>
                <Separator />
                <div>
                    <Button variant="destructive" onClick={logout}>{t('account.logout')}</Button>
                </div>
            </div>
        </>
    )
}