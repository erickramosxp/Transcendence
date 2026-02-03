import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function PrivateRoute({children}) {

    const { isAuthenticated } = useAuth();

    if (!isAuthenticated)
        return <Navigate to={"/"} replace/>;
    
    return children;
}