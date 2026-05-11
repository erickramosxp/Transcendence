import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/app/providers/AuthProvider"

import { Button, ThemeToggle, LanguageSwitcher, SideBarNav } from "@/design-system"
import { Bell, Home, LogOut, MessageCircle, User, Users } from "lucide-react"

export function LeftSidebar() {
    const { logout } = useAuth()
    const { t } = useTranslation("common")

    const sideBarItems = useMemo(
        () => [
            { label: t("nav.feed"), icon: Home, to: "/feed", end: true },
            { label: t("nav.messages"), icon: MessageCircle, to: "/chat", end: false },
            { label: t("nav.notifications"), icon: Bell, to: "/notifications", end: true },
            { label: t("nav.friends"), icon: Users, to: "/friends", end: true },
            { label: t("nav.profile"), icon: User, to: "/profile", end: true },
        ],
        [t],
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
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={logout}
                                >
                                    <LogOut />
                                </Button>
                            </div>
                        </div>
                    }
            />

            {/* <nav className="sticky top-0 h-screen flex flex-col gap-2 underline p-4 border-r w-48 shrink-0 hidden lg:flex stick">
                <Link to={"/"}>Home</Link>
                <Link to={"/feed"}>Feed</Link>
                <Link to={"/chat"}>Chat</Link>
                <Link to={"/friends"}>Friends</Link>
                <Link to={"/profile"}>Profile</Link>
                <Link to={"/editProfile"}>Edit Profile</Link>
                <ThemeToggle />
                <LanguageSwitcher />
                <Button onClick={logout}>Logout</Button>
            </nav> */}
        </>
    )
}

export default LeftSidebar;
