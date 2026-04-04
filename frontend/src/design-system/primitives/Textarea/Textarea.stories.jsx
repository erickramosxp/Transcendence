import * as React from 'react'
import { Textarea } from './Textarea'

const meta = {
    title: 'Primitives/Textarea',
    tags: ['autodocs'],
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    args: {
        placeholder: 'Digite sua mensagem...',
        disabled: false,
        maxLength: undefined,
        rows: 4,
    },
    argTypes: {
        placeholder: {
            control: 'text',
        },
        disabled: {
            control: 'boolean',
        },
        maxLength: {
            control: 'number',
        },
        rows: {
            control: 'number',
        },
        'aria-invalid': {
            control: 'boolean',
        },
    },
}

export default meta

export const Default = {
    render: (args) => (
        <div className="w-[420px]">
            <Textarea {...args} />
        </div>
    ),
}

export const WithMaxLength = {
    args: {
        maxLength: 120,
        placeholder: 'Escreva até 120 caracteres...',
    },
    render: (args) => {
        const [value, setValue] = React.useState('')

        return (
            <div className="w-[420px] space-y-2">
                <Textarea
                    {...args}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
                <div className="text-right text-xs text-muted-foreground">
                    {value.length}/{args.maxLength}
                </div>
            </div>
        )
    },
}

export const Invalid = {
    args: {
        'aria-invalid': true,
        defaultValue: 'Texto com erro de validação.',
    },
    render: (args) => (
        <div className="w-[420px] space-y-2">
            <Textarea {...args} />
            <p className="text-xs text-destructive">
                Esse campo precisa ser revisado.
            </p>
        </div>
    ),
}

export const Disabled = {
    args: {
        disabled: true,
        defaultValue: 'Campo desabilitado.',
    },
    render: (args) => (
        <div className="w-[420px]">
            <Textarea {...args} />
        </div>
    ),
}

export const WithLabel = {
    args: {
        placeholder: 'Conte um pouco sobre você...',
    },
    render: (args) => (
        <div className="w-[420px] space-y-2">
            <label className="text-sm font-medium text-foreground">
                Descrição
            </label>
            <Textarea {...args} />
            <p className="text-xs text-muted-foreground">
                Use esse campo para observações, comentários ou contexto adicional.
            </p>
        </div>
    ),
}