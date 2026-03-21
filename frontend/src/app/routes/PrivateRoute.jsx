import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function PrivateRoute({children}) {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <span>Carregando...</span> 
            </div>
        );
    }

    if (!isAuthenticated)
        return <Navigate to={"/"} replace/>;
    
    return children;
}