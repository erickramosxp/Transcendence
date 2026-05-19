import {
    Button,
    Input,
    Label,
    Loading,
} from '@/design-system'
import { GoogleIcon } from '@/features/auth/components/GoogleIcon';

import { changePassword, getMyAuthType } from '@/features/profile/services/profileService';
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify';
import { LIMITS } from '@/shared/validation/limits';
import { validateChangePassword } from '@/shared/validation/validators';

export const SecurityTab = () => {

    const { t } = useTranslation(['settings', 'auth']);
    const [loading, setLoading] = useState(true);
    const [isOAuth, setIsOAuth] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {

        const getAuthType = async () => {
            setLoading(true);
            try {
                const resp = await getMyAuthType();
                if (!resp.providers.includes("LOCAL")) {
                    setIsOAuth(true);
                }
            } finally {
                setLoading(false);
            }
        }

        getAuthType();
    }, []);

    const cleanInput = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    }

    const handleSettingsSubmit = async (e) => {
        e.preventDefault()

        const result = validateChangePassword(
            { currentPassword, newPassword, confirmNewPassword },
            t
        );
        if (!result.ok) {
            toast.warn(result.message);
            return;
        }

        setDisableButton(true);
        try {
            await changePassword({currentPassword, newPassword, confirmNewPassword});
            toast.success(t('security.successChanged'));
            cleanInput();
        } catch {
            toast.error(t('security.errorChanged'));
        } finally {
            setDisableButton(false);
        }
    }

    if (loading) {
        return (
            <div className='py-20'>
                <Loading className='m-auto' />
            </div>
        )
    }

    if (isOAuth) {
        return (
            <div className='flex justify-center items-center py-20 h-20'>
                <span className='flex justify-center items-center gap-2'>
                    <GoogleIcon />
                    <p className='text-muted-foreground'>
                        {t('security.oauthMessage')}
                    </p>
                </span>
            </div>
        );
    }

    return (
        <div className='p-4 text-center'>
            <h2>{t('security.title')}</h2>

            <form
                className='flex flex-col gap-3'
                onSubmit={handleSettingsSubmit}
            >
                <div>
                    <Label htmlFor="currentPassword">
                        {t('security.currentPassword')}
                    </Label>

                    <Input
                        id="currentPassword"
                        type="password"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        value={currentPassword}
                    />
                </div>

                <div>
                    <Label htmlFor="newPassword">
                        {t('security.newPassword')}
                    </Label>

                    <Input
                        id="newPassword"
                        type="password"
                        maxLength={LIMITS.passwordMax}
                        onChange={(e) => setNewPassword(e.target.value)}
                        value={newPassword}
                    />
                </div>

                <div>
                    <Label htmlFor="confirmNewPassword">
                        {t('security.confirmPassword')}
                    </Label>

                    <Input
                        id="confirmNewPassword"
                        type="password"
                        maxLength={LIMITS.passwordMax}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        value={confirmNewPassword}
                    />
                </div>
                <div className='text-left pl-3 text-sm text-red-600'>
                    {confirmNewPassword.trim().length > 0 &&
                        newPassword !== confirmNewPassword && (
                            <p>
                                {t('security.passwordMismatch')}
                            </p>
                        )}
                    {newPassword.length > 0 && newPassword.length < LIMITS.passwordMin &&
                        <p>
                            {t('security.passwordTooShort')}
                        </p>
                    }
                </div>


                <div>
                    <Button type='submit' disabled={disableButton}>
                        {t('security.submit')}
                    </Button>
                </div>
            </form>
        </div>
    )
}
