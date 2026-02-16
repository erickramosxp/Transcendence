import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../features/auth/authService";

const AuthContext = createContext(null);

export function AuthProvider({children}) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    let navigate = useNavigate();


    useEffect(() => {

        const storedUser = localStorage.getItem('@trascendence:user');
        const storedToken = localStorage.getItem('@trascendence:token');

        if (storedUser && storedToken) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) =>  {

        try {
            const resp = await authService.login(credentials);

            const { token, user } = resp.data;
            localStorage.setItem('@trascendence:token', token);
            localStorage.setItem('@trascendence:user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);
        } catch (err){
            const errorMsg = err.response?.data?.message || "Ocorreu um erro inesperado";
            alert(errorMsg);
        }

    }

    const register = (infoUserRegister) => {

        console.log(infoUserRegister);
        alert('Em desenvolvimento');
    }

    const logout = () => {
        localStorage.removeItem('@trascendence:token');
        localStorage.removeItem('@trascendence:user');
        setIsAuthenticated(false);
        navigate("/");
    }

    const socialLogin = () => {
        alert("Login social em desenvolvimento");
    } 

    return (
        <AuthContext.Provider value={{isAuthenticated, user, loading, login, register, socialLogin, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);
}