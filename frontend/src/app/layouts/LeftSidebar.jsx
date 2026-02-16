import { Link } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { Button } from "../../components/ui/Button";

export function LeftSidebar() {

    const { logout } = useAuth();

    return (
        <>
            <nav className="flex flex-col gap-2 underline p-4 border-r min-h-screen w-48">
                <Link to={"/"}>Home</Link>
                <Link to={"/feed"}>Feed</Link>
                <Link to={"/chat"}>Chat</Link>
                <Link to={"/search"}>Search</Link>
                <Link to={"/profile"}>Profile</Link>
                <Link to={"/editProfile"}>Edit Profile</Link>
                <Button onClick={logout}>Logout</Button>
            </nav>
        </>
    )
}

export default LeftSidebar;
