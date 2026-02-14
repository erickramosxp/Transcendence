import { Button } from "../../shared/components/Button";

export function RegisterForm({onSubmit, onSwitch}) {

    return (
        <>
            <h2>Registrar</h2>
            <input type="text" placeholder="Nome" />
            <input type="text" placeholder="Email"/>
            <input type="password" placeholder="Senha"/>

            <Button onClick={onSubmit}>Criar conta</Button>

            <p>
                Já tem conta?{" "}
                <button className="underline" onClick={onSwitch}>
                    Entrar
                </button>
            </p>
        </>
    )
}