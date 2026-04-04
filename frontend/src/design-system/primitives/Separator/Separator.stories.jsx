import { Separator } from './Separator'

export default {
    title: 'Primitives/Separator',
    tags: ['autodocs'],
    component: Separator,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        orientation: {
            control: 'inline-radio',
            options: ['horizontal', 'vertical'],
        },
        decorative: {
            control: 'boolean',
        },
    },
    args: {
        orientation: 'horizontal',
        decorative: true,
    },
}

export const Default = {
    render: (args) => (
        <div className="w-[320px] rounded-md border border-zinc-200 bg-white p-4">
            <div className="text-sm font-medium text-zinc-900">Header</div>
            <Separator {...args} className="my-4" />
            <p className="text-sm text-zinc-600">
                Conteúdo separado visualmente por uma linha horizontal.
            </p>
        </div>
    ),
}

export const Vertical = {
    args: {
        orientation: 'vertical',
    },
    render: (args) => (
        <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-white px-4">
            <span className="text-sm text-zinc-700">Profile</span>
            <Separator {...args} className="mx-4" />
            <span className="text-sm text-zinc-700">Settings</span>
            <Separator {...args} className="mx-4" />
            <span className="text-sm text-zinc-700">Logout</span>
        </div>
    ),
}

export const InContent = {
    render: (args) => (
        <div className="w-[360px] rounded-md border border-zinc-200 bg-white p-4">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Conta</h3>
                    <p className="text-sm text-zinc-600">
                        Gerencie seus dados e preferências.
                    </p>
                </div>

                <Separator {...args} />

                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Segurança</h3>
                    <p className="text-sm text-zinc-600">
                        Atualize senha e configurações de acesso.
                    </p>
                </div>
            </div>
        </div>
    ),
}

export const Semantic = {
    args: {
        decorative: false,
    },
    render: (args) => (
        <div className="w-[360px] rounded-md border border-zinc-200 bg-white p-4">
            <div className="space-y-3">
                <section>
                    <h3 className="text-sm font-medium text-zinc-900">Informações pessoais</h3>
                    <p className="text-sm text-zinc-600">
                        Nome, e-mail e dados principais.
                    </p>
                </section>

                <Separator {...args} className="my-2" />

                <section>
                    <h3 className="text-sm font-medium text-zinc-900">Preferências</h3>
                    <p className="text-sm text-zinc-600">
                        Idioma, notificações e personalização.
                    </p>
                </section>
            </div>
        </div>
    ),
}