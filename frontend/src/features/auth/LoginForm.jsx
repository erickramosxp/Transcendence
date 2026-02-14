import { useState } from "react";
import { Button } from "../../shared/components/Button";

export function LoginForm({onSubmit, onSwitch}) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        onSubmit({email, password});
    }
    
    return (
        <>
            <h2>Entrar</h2>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}/>

            <Button onClick={handleSubmit}>Login</Button>

            <p>
                Não tem conta?{" "}
                <button className="underline" onClick={onSwitch}>
                    Registrar
                </button>
            </p>
        </>
    );
}