import { Button} from '../../shared/components/Button'
import { useAuth } from '../../app/providers/AuthProvider';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useState } from 'react';


export function AuthContainer() {

    const { login } = useAuth();
    const [mode, setMode] = useState("login");

    const handleLogin = (credentials) => {
        login(credentials);
    }

    const handleRegister = () => {
        login();
    }

    return (
        <div className='bg-white p-6 rounded shadow w-80 text-center'>

            {
                mode === "login" && (
                    <LoginForm 
                    onSubmit={handleLogin}
                    onSwitch={() => setMode("register")}
                    />
                )
            }
            {
                mode === "register" && (
                    <RegisterForm 
                        onSubmit={handleRegister}
                        onSwitch={() => setMode("login")}
                    />
                )
            }
        </div>
    );
}