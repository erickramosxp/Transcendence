import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "@/features/auth/authService";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
const AuthContext = createContext(null);

const clientId = import.meta.env.GOOGLE_WEB_CLIENT_ID;

export function AuthProvider({children}) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    let navigate = useNavigate();
    const { t } = useTranslation('authProvider');


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

            toast.success(t('login.success'));
            setTimeout(() => navigate('/feed'), 1000);

        } catch (err){
            console.log(err);
            const errorMsg = err.response?.data?.message || t('login.error');
            console.log(errorMsg);
            toast.error(errorMsg);
        }

    }

    const register = async (infoUserRegister) => {

        try {
            const resp = await authService.register(infoUserRegister);

            const { token, user } = resp.data;

            toast.success(t('register.success'));

            localStorage.setItem('@trascendence:token', token);
            localStorage.setItem('@trascendence:user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            setTimeout(() => {
                toast.success(t('register.redirect'));
                navigate('/feed');
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || t('register.error');
            console.log(errorMsg);
            toast.error(errorMsg);
        }
    }

    const logout = () => {
        localStorage.removeItem('@trascendence:token');
        localStorage.removeItem('@trascendence:user');
        setIsAuthenticated(false);
        navigate("/");
    }


    const socialLogin = clientId ? (
        useGoogleLogin({
            flow: "auth-code",
            onSuccess: async (googleCodeResponse) => {

                try {
                    const resp = await authService.socialLogin({ code: googleCodeResponse.code });

                    const { token, user } = resp.data;

                    localStorage.setItem('@trascendence:token', token);
                    localStorage.setItem('@trascendence:user', JSON.stringify(user));

                    setUser(user);
                    setIsAuthenticated(true);

                    setTimeout(() => {
                    toast.success(t('socialLogin.success'));
                    navigate('/feed');
                    }, 2000);

                } catch (err) {

                    const errorMsg = err.response?.data?.message || t('socialLogin.error');
                    console.log(errorMsg);
                    toast.error(errorMsg);
                }
            },
            onError: () => toast.error(t('socialLogin.googleError')),
        })
    ) : (
        null
    )

    return (
        <AuthContext.Provider value={{isAuthenticated, user, loading, login, register, socialLogin, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);
}
