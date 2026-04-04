import { Button } from './Button'
import { expect, fn } from 'storybook/test';

export default {
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    args: {
        onClick: fn(),
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


export const Disabled = {
    args: {
        disabled: true,
        label: 'Button',
        children: 'Button',
    },
    play: async function ({ args, canvas, userEvent }) {
        const button = canvas.getByRole('button', { name: /Button/i });

        // 👇 Simulate behavior
        await userEvent.click(button);

        // 👇 Make assertions
        await expect(button).toHaveAttribute('aria-disabled', 'true');
        await expect(args.onClick).not.toHaveBeenCalled();
    }
};

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