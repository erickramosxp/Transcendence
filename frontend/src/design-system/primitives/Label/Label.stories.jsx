import { Label } from './Label'
import { Input } from '../Input/Input'

export default {
    title: 'Primitives/Label',
    component: Label,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        children: {
            control: 'text',
        },
    },
}

export const Playground = {
    args: {
        children: 'Email',
    },
    render: (args) => (
        <div className="flex flex-col gap-2 w-[300px]">
            <Label htmlFor="email">{args.children}</Label>
            <Input id="email" placeholder="seu@email.com" />
        </div>
    ),
}

export const WithInput = {
    render: () => (
        <div className="flex flex-col gap-2 w-[300px]">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Seu nome" />
        </div>
    ),
}

export const Disabled = {
    render: () => (
        <div className="flex flex-col gap-2 w-[300px]">
            <Label htmlFor="email">Email</Label>
            <Input id="email" disabled className="peer" placeholder="Desabilitado" />
        </div>
    ),
}

export const WithError = {
    render: () => (
        <div className="flex flex-col gap-2 w-[300px]">
            <Label htmlFor="email">Email</Label>
            <Input id="email" aria-invalid placeholder="Email inválido" />
            <span className="text-sm text-destructive">
                Email inválido
            </span>
        </div>
    ),
}

export const FormExample = {
    render: () => (
        <div className="flex flex-col gap-4 w-[300px]">
            <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="seu@email.com" />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" />
            </div>
        </div>
    ),
}

export const AllStates = {
    render: () => (
        <div className="flex flex-col gap-4 w-[300px]">
            <div className="flex flex-col gap-1">
                <Label htmlFor="default">Default</Label>
                <Input id="default" />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="disabled">Disabled</Label>
                <Input id="disabled" disabled className="peer" />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="error">Error</Label>
                <Input id="error" aria-invalid />
            </div>
        </div>
    ),
}