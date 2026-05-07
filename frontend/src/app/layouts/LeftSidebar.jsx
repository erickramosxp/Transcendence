import { Link } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"

import { Button, ThemeToggle, LanguageSwitcher, SideBarNav } from "@/design-system";
import { LogOut } from "lucide-react"

export function LeftSidebar() {

    const { logout } = useAuth();
    const SideBarItems = [
        { label: 'Home', to: '/' },
        { label: 'Feed', to: '/feed' },
        { label: 'Chat', to: '/chat' },
        { label: 'Friends', to: '/friends' },
        { label: 'Profile', to: '/profile' },
        { label: 'Edit Profile', to: '/editProfile' },
    ];
    return (
        <>
            <SideBarNav
                items={SideBarItems}
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
