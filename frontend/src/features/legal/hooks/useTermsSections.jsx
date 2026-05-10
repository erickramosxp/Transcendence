import {
    User,
    Image,
    HeartHandshake,
    ShieldAlert,
    CloudUpload,
    Trash2,
    Server,
    RefreshCcw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function useTermsSections() {

    const { t } = useTranslation('termsOfService');

    return [
        {
            value: "user",
            title: t('sections.user.title'),
            icon: User ,
            content:
                t('sections.user.content'),
        },
        {
            value: "posts",
            title: t('sections.posts.title'),
            icon: Image ,
            content:
                t('sections.posts.content'),
        },
        {
            value: "interaction",
            title: t('sections.interaction.title'),
            icon: HeartHandshake ,
            content:
                t('sections.interaction.content'),
        },
        {
            value: "ban",
            title: t('sections.ban.title'),
            icon: ShieldAlert,
            content: `${t('sections.ban.content')}`,
        },
        {
            value: "upload",
            title:  t('sections.upload.title'),
            icon: CloudUpload,
            content:
                t('sections.upload.content'),
        },
        {
            value: "delete",
            title: t('sections.delete.title'),
            icon: Trash2 ,
            content:
                t('sections.delete.content'),
        },
        {
            value: "service",
            title: t('sections.service.title'),
            icon: Server,
            content:
                t('sections.service.content'),
        },
        {
            value: "limitation",
            title: t('sections.limitation.title'),
            icon: RefreshCcw ,
            content:
                t('sections.limitation.content'),
        },
    ]
}