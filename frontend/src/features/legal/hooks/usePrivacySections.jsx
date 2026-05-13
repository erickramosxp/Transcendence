
import {
    Database,
    Settings,
    Share2,
    ImagePlus,
    KeyRound,
    Shield,
    UserCheck,
    Archive,
    Mail
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function usePrivacySections() {

    const { t } = useTranslation('privacyPolicy');

    return [
        {
            value: "collection",
            title: t('sections.collection.title'),
            icon: Database,
            content: `${t('sections.collection.content')}`,
        },

        {
            value: "usage",
            title: t('sections.usage.title'),
            icon: Settings,
            content: `${t('sections.usage.content')}`,
        },

        {
            value: "sharing",
            title: t('sections.sharing.title'),
            icon: Share2,
            content: `${t('sections.sharing.content')}`,
        },

        {
            value: "storage",
            title: t('sections.storage.title'),
            icon: ImagePlus,
            content: `${t('sections.storage.content')}`,
        },

        {
            value: "auth",
            title: t('sections.auth.title'),
            icon: KeyRound,
            content: `${t('sections.auth.content')}`,
        },

        {
            value: "security",
            title: t('sections.security.title'),
            icon: Shield,
            content: `${t('sections.security.content')}`,
        },

        {
            value: "rights",
            title: t('sections.rights.title'),
            icon: UserCheck,
            content: `${t('sections.rights.content')}`,
        },

        {
            value: "retention",
            title: t('sections.retention.title'),
            icon: Archive,
            content: `${t('sections.retention.content')}`,
        },

        {
            value: "contact",
            title:  t('sections.contact.title'),
            icon: Mail,
            content: (
            <>
                <p>{t('sections.contact.content')}</p>

                <a
                    href="mailto:contato@videa.com"
                    className="underline text-primary"
                >
                    contato@videa.com
                </a>
            </>
            ),
        },
    ]
}