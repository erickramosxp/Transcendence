import { Avatar, AvatarWithStatus } from './Avatar'

export default {
    title: 'Primitives/Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl', 'xl2', 'xl3', 'xxl'],
        },
        status: {
            control: 'select',
            options: ['online', 'offline', 'busy'],
        },
        src: {
            control: 'text',
        },
        name: {
            control: 'text',
        },
        username: {
            control: 'text',
        },
    },
}

export const Playground = {
    args: {
        name: 'João Silva',
        size: 'md',
    },
    render: (args) => <Avatar {...args} />,
}

export const WithImage = {
    args: {
        src: 'https://i.pravatar.cc/150?img=3',
        name: 'João Silva',
    },
}

export const Fallback = {
    args: {
        name: 'Maria Souza',
    },
}

export const Sizes = {
    render: () => (
        <div className="flex items-end gap-4">
            <Avatar name="A" size="sm" />
            <Avatar name="A" size="md" />
            <Avatar name="A" size="lg" />
            <Avatar name="A" size="xl" />
            <Avatar name="A" size="xxl" />
        </div>
    ),
}

export const WithStatus = {
    args: {
        name: 'João Silva',
        status: 'online',
    },
    render: (args) => <AvatarWithStatus {...args} />,
}

export const StatusVariants = {
    render: () => (
        <div className="flex gap-4">
            <AvatarWithStatus name="A" status="online" />
            <AvatarWithStatus name="A" status="offline" />
            <AvatarWithStatus name="A" status="busy" />
        </div>
    ),
}