import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "@/features/auth/authService";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { getUserPreferences } from "@/shared/api/preferencesService";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/design-system/hooks/useTheme";
import { Loading } from "@/design-system";
import i18n from "@/i18n";
const AuthContext = createContext(null);

const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

export function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socialLoginLoading, setSocialLoginLoading] = useState(false);
    const { changeLanguage } = useLanguage();
    const { changeTheme } = useTheme();
    let navigate = useNavigate();
    const { t } = useTranslation('authProvider');

    const handleSocialLoginRedirect = async (code) => {

        try {
            const resp = await authService.socialLogin({ code });
            const { token, user } = resp.data;
            localStorage.setItem('@trascendence:token', token);
            localStorage.setItem('@trascendence:user', JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
            try {
                const userPreferences = await getUserPreferences();
                await changeLanguage(userPreferences.language);
                await changeTheme(userPreferences.theme);
            } catch (e) {
                console.log(e);
            }
            setTimeout(() => {
                toast.success(i18n.t('authProvider:socialLogin.success'));
                navigate('/feed');
                setSocialLoginLoading(false);
            }, 1200);
        } catch (err) {
            const errorMsg = err.response?.data?.message || i18n.t('authProvider:socialLogin.error');
            toast.error(errorMsg);
            setSocialLoginLoading(false);
        }
    };


    useEffect(() => {
        const storedUser = localStorage.getItem('@trascendence:user');
        const storedToken = localStorage.getItem('@trascendence:token');
        if (storedUser && storedToken) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            setSocialLoginLoading(true);
            window.history.replaceState({}, document.title, window.location.pathname);

            handleSocialLoginRedirect(code);
        }
    }, []);

    const login = async (credentials) => {

        try {
            const resp = await authService.login(credentials);

            const { token, user } = resp.data;

            localStorage.setItem('@trascendence:token', token);
            localStorage.setItem('@trascendence:user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            try {
                const userPreferences = await getUserPreferences();
                await changeLanguage(userPreferences.language);
                await changeTheme(userPreferences.theme);
            } catch (e) {
                console.log(e);
            }

            toast.success(i18n.t('authProvider:login.success'));
            setTimeout(() => { navigate('/feed') }, 1000);

        } catch (err) {
            const status = err.response?.status;

            let errorMsg;
            if (status === 401) {
                errorMsg = i18n.t('auth:errors.invalidCredentials');
            } else if (status === 400) {
                errorMsg = err.response?.data?.message || i18n.t('auth:errors.error');
            } else {
                errorMsg = i18n.t('auth:errors.error');
            }

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
            const status = err.response?.status;
            const backendMsg = err.response?.data?.message;

            let errorMsg;
            if (status === 400 && backendMsg?.includes('Email already'))
                errorMsg = i18n.t('auth:errors.emailInUse');
            else if (status === 400 && backendMsg?.includes('Username already'))
                errorMsg = i18n.t('auth:errors.usernameInUse');
            else
                errorMsg = backendMsg || i18n.t('auth:errors.error');

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
            ux_mode: "redirect",
            redirect_uri: window.location.origin,
            onError: () => toast.error(i18n.t('authProvider:socialLogin.googleError')),
        })
    ) : (
        null
    );

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, socialLogin, logout }}>
            {socialLoginLoading && (
                <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/10 backdrop-blur-xs transition-all duration-300">
                    <Loading full={true} />
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);
}
