import { Link } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { Button } from "../../components/ui/Button";

export function LeftSidebar() {

    const { logout } = useAuth();

    return (
        <>
            <nav className="flex gap-2 underline">
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