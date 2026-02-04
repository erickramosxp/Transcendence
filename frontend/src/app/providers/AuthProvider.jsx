import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({children}) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    let navigate = useNavigate();

    const login = (credentials) =>  {
        console.log(credentials);
        setIsAuthenticated(true);
    }
    const logout = () => {
        setIsAuthenticated(false);
        navigate("/");
    }
    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);
}