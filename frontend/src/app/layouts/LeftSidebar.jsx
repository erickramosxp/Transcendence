import { Link } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"
import { Button } from "@/design-system/primitives/Button";
import { ThemeToggle } from "@/design-system/components/ThemeToggle";

export function LeftSidebar() {

    const { logout } = useAuth();

    return (
        <>
            <nav className="flex gap-2">
                <Link to={"/"} className="underline">Home</Link>
                <Link to={"/feed"} className="underline">Feed</Link>
                <Link to={"/chat"} className="underline">Chat</Link>
                <Link to={"/search"} className="underline">Search</Link>
                <Link to={"/profile"} className="underline">Profile</Link>
                <Link to={"/editProfile"} className="underline">Edit Profile</Link>
                <ThemeToggle />
                <Button onClick={logout}>Logout</Button>
            </nav>
        </>
    )
}