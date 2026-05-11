import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/design-system'

import { AccountTab } from './tabs/AccountTab'
import { SecurityTab } from './tabs/SecurityTab'
import { AppearanceTab } from './tabs/AppearanceTab'

import { useTranslation } from 'react-i18next'


export const SettingsContent = () => {


    const { t } = useTranslation('settings');

    return (
        <Tabs defaultValue="account">
            <TabsList className="rounded-none">
                <TabsTrigger value="account">
                    {t('tabs.account')}
                </TabsTrigger>

                <TabsTrigger value="security">
                    {t('tabs.security')}
                </TabsTrigger>

                <TabsTrigger value="appearance">
                    {t('tabs.appearance')}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
                <AccountTab />
            </TabsContent>

            <TabsContent value="security">
                <SecurityTab />
            </TabsContent>

            <TabsContent value="appearance">
                <AppearanceTab />
            </TabsContent>
        </Tabs>
    )
}