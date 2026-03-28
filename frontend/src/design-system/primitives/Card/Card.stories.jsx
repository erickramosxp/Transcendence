import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAction,
} from './Card'

import { Button } from '../Button/Button'

export default {
    title: 'Primitives/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
}

export const Default = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Título</CardTitle>
                <CardDescription>Descrição do card</CardDescription>
            </CardHeader>

            <CardContent>
                <p>Conteúdo aqui</p>
            </CardContent>

            <CardFooter>
                <button>Salvar</button>
            </CardFooter>
        </Card>
    ),
}

export const WithAction = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Projeto</CardTitle>
                <CardDescription>Detalhes do projeto</CardDescription>

                <CardAction>
                    <button>⋮</button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <p>Conteúdo com ação no header</p>
            </CardContent>
        </Card>
    ),
}

export const FormCard = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Entre na sua conta</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <input placeholder="Email" className="border p-2 rounded" />
                <input placeholder="Senha" type="password" className="border p-2 rounded" />
            </CardContent>

            <CardFooter className="flex justify-end">
                <Button>Entrar</Button>
            </CardFooter>
        </Card>
    ),
}

export const Minimal = {
    render: () => (
        <Card className="w-[300px] p-6">
            <p>Card simples sem header</p>
        </Card>
    ),
}

export const Playground = {
    args: {
        title: 'Editável',
        description: 'Aqui você pode testar diferentes composições',
        content: 'Troque coisas aqui direto no código',
    },
    argTypes: {
        className: {
            control: 'text',
        },
    },
    render: (args) => (
        <Card className={`w-[350px] ${args.className}`}>
            <CardHeader>
                <CardTitle>{args.title}</CardTitle>
                <CardDescription>{args.description}</CardDescription>
            </CardHeader>

            <CardContent>
                <p>{args.content}</p>
            </CardContent>
        </Card>
    ),
}

export const WithButton = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Salvar alterações</CardTitle>
                <CardDescription>
                    Confirme para aplicar as mudanças no sistema
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p>
                    Ao clicar em salvar, suas configurações serão atualizadas.
                </p>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost">Cancelar</Button>
                <Button>Salvar</Button>
            </CardFooter>
        </Card>
    ),
}

export const WithButtonLoading = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Processando</CardTitle>
                <CardDescription>
                    Aguarde enquanto salvamos seus dados
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p>Isso pode levar alguns segundos...</p>
            </CardContent>

            <CardFooter className="flex justify-end">
                <Button disabled>Salvando...</Button>
            </CardFooter>
        </Card>
    ),
}