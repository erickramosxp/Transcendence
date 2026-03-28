import { Input } from './Input'
import { Mail, Lock } from 'lucide-react'

export default {
    title: 'Primitives/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password'],
        },
        placeholder: {
            control: 'text',
        },
        disabled: {
            control: 'boolean',
        },
    },
}

export const Playground = {
    args: {
        placeholder: 'Digite algo...',
        type: 'text',
    },
    render: (args) => (
        <div className="w-[300px]">
            <Input {...args} />
        </div>
    ),
}

export const WithIcon = {
    args: {
        placeholder: 'Email',
        icon: <Mail className="h-4 w-4 text-muted-foreground" />,
    },
    render: (args) => (
        <div className="w-[300px]">
            <Input {...args} />
        </div>
    ),
}

export const Password = {
    args: {
        placeholder: 'Password',
        icon: <Lock className="h-4 w-4 text-muted-foreground" />,
    },
    render: (args) => (
        <div className="relative w-[300px]">
            <Input {...args} type="password" />
        </div>
    ),
}

export const Error = {
    render: () => (
        <div className="w-[300px]">
            <Input placeholder="Email inválido" aria-invalid />
        </div>
    ),
}

export const Disabled = {
    args: {
        placeholder: 'Desabilitado',
        disabled: true,
    },
    render: (args) => (
        <div className="w-[300px]">
            <Input {...args} />
        </div>
    ),
}

export const AllStates = {
    render: () => (
        <div className="flex flex-col gap-4 w-[300px]">
            <Input placeholder="Default" />
            <Input placeholder="Com erro" aria-invalid />
            <Input placeholder="Desabilitado" disabled />
        </div>
    ),
}