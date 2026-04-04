import { TextWithLink } from './TextWithLink'

const meta = {
    title: 'Primitives/TextWithLink',
    tags: ['autodocs'],
    component: TextWithLink,
    parameters: {
        layout: 'centered',
    },
    args: {
        text: 'Acesse https://example.com para mais informações.',
        className: 'text-sm text-foreground',
    },
    argTypes: {
        text: {
            control: 'text',
        },
        className: {
            control: 'text',
        },
    },
}

export default meta

export const Default = {
    render: (args) => (
        <div className="w-[420px] rounded-lg border border-zinc-200 bg-white p-4">
            <TextWithLink {...args} />
        </div>
    ),
}

export const PlainText = {
    args: {
        text: 'Esse texto não possui nenhum link detectável.',
    },
    render: (args) => (
        <div className="w-[420px] rounded-lg border border-zinc-200 bg-white p-4">
            <TextWithLink {...args} />
        </div>
    ),
}

export const SingleLink = {
    args: {
        text: 'Confira a documentação em https://ui.shadcn.com',
    },
    render: (args) => (
        <div className="w-[420px] rounded-lg border border-zinc-200 bg-white p-4">
            <TextWithLink {...args} />
        </div>
    ),
}

export const MultipleLinks = {
    args: {
        text: 'Referências: https://react.dev, https://storybook.js.org e https://www.radix-ui.com',
    },
    render: (args) => (
        <div className="w-[420px] rounded-lg border border-zinc-200 bg-white p-4">
            <TextWithLink {...args} />
        </div>
    ),
}

export const LongLink = {
    args: {
        text: 'Link longo para testar quebra de linha: https://example.com/products/category/item/details/very-long-slug-name-for-preview-test',
    },
    render: (args) => (
        <div className="w-[320px] rounded-lg border border-zinc-200 bg-white p-4">
            <TextWithLink {...args} />
        </div>
    ),
}

export const CustomStyle = {
    args: {
        text: 'Veja mais em https://example.com/support',
        className: 'text-base leading-7 text-zinc-700',
    },
    render: (args) => (
        <div className="w-[420px] rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <TextWithLink {...args} />
        </div>
    ),
}