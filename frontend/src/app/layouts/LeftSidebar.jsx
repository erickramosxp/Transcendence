import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/app/providers/AuthProvider"

import { Button, ThemeToggle, LanguageSwitcher, SideBarNav } from "@/design-system"
import { Bell, Home, LogOut, MessageCircle, User, Users } from "lucide-react"
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore"

export function LeftSidebar() {
    const { logout } = useAuth()
    const { t } = useTranslation("common")
    const unreadCount = useNotificationStore((state) => state.unreadCount)

    const sideBarItems = useMemo(
        () => [
            { label: t("nav.feed"), icon: Home, to: "/feed", end: true },
            { label: t("nav.messages"), icon: MessageCircle, to: "/chat", end: false },
            {
                label: t("nav.notifications"),
                icon: Bell,
                to: "/notifications",
                end: true,
                badge: unreadCount,
            },
            { label: t("nav.friends"), icon: Users, to: "/friends", end: true },
            { label: t("nav.profile"), icon: User, to: "/profile", end: true },
        ],
        [t, unreadCount],
    )
    return (
        <>
            <SideBarNav
                items={sideBarItems}
                    actions={
                        <div className="w-full">
                            <div className="flex items-center justify-evenly w-full">
                                <ThemeToggle />
                                <LanguageSwitcher />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    data-testid="auth-logout"
                                    aria-label={t("nav.logout")}
                                    className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={logout}
                                >
                                    <LogOut />
                                </Button>
                            </div>
                        </div>
                    }
            />
        </>
    )
}

export default LeftSidebar;
