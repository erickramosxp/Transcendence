import { Button } from "../../shared/components/Button";

export function LoginForm({onSubmit, onSwitch}) {

    return (
        <>
            <h2>Entrar</h2>
            <input type="text" placeholder="Email"/>
            <input type="text" placeholder="Senha" />

            <Button onClick={onSubmit}>Login</Button>

            <p>
                Não tem conta?{" "}
                <button className="underline" onClick={onSwitch}>
                    Registrar
                </button>
            </p>
        </>
    );
}