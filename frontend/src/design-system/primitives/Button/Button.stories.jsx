import { Button } from './Button'

export default {
    title: 'Primitives/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'primary',
                'outline',
                'secondary',
                'ghost',
                'nav-active',
                'destructive',
                'link',
            ],
        },
        size: {
            control: 'select',
            options: [
                'default',
                'sm',
                'lg',
                'icon',
                'full',
                'nav',
                'rounded',
                'follow',
            ],
        },
    },
}

export const Primary = {
    args: {
        children: 'Botão',
        variant: 'primary',
        size: 'default',
    },
}

export const AllVariants = {
    args: {
        size: 'default',
    },
    render: (args) => (
        <div className="flex flex-wrap gap-2">
            <Button {...args} variant="primary">Primary</Button>
            <Button {...args} variant="secondary">Secondary</Button>
            <Button {...args} variant="outline">Outline</Button>
            <Button {...args} variant="ghost">Ghost</Button>
            <Button {...args} variant="destructive">Destructive</Button>
        </div>
    ),
}