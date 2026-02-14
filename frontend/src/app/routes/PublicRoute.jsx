import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";


export function PublicRoute({children}) {

    const { isAuthenticated } = useAuth();

    if (isAuthenticated)
        return <Navigate to={"/feed"} replace />;

    return children;
}