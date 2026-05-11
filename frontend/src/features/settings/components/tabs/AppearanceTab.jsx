import {
    Label,
    Separator,
    LanguageSwitcher,
    ThemeToggle,
} from '@/design-system'

import { useTranslation } from 'react-i18next'

export const AppearanceTab = () => {

    const { t } = useTranslation('settings')

    return (
        <div className='flex flex-col gap-4 p-4'>
            <div className='flex gap-3 items-center'>
                <Label>
                    {t('appearance.theme')}
                </Label>

                <ThemeToggle />
            </div>

            <Separator />

            <div className='flex gap-3 items-center'>
                <Label>
                    {t('appearance.language')}
                </Label>

                <LanguageSwitcher activeToastNotification />
            </div>
        </div>
    )
}