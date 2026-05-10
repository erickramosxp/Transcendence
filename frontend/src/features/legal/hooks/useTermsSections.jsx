import {
    User,
    Image,
    HeartHandshake,
    ShieldAlert,
    CloudUpload,
    Trash2,
    Server,
    RefreshCcw
} from 'lucide-react'

export function useTermsSections() {

    return [
        {
            value: "user",
            title: "Conta do usuário",
            icon: User ,
            content:
                "O usuário é responsável pelas atividades realizadas em sua conta. É responsabilidade do usuário manter suas credenciais seguras e não compartilhar acesso com terceiros.",
        },
        {
            value: "posts",
            title: "Conteúdo publicado",
            icon: Image ,
            content:
                "Os usuários podem publicar conteúdos como textos, imagens, vídeos, comentários e mensagens. Cada usuário é integralmente responsável pelos conteúdos publicados em sua conta.",
        },
        {
            value: "interaction",
            title: "Interações sociais",
            icon: HeartHandshake ,
            content:
                "A plataforma permite interações entre usuários, incluindo curtidas, comentários, solicitações de amizade e troca de mensagens. Os usuários devem manter comportamento respeitoso durante essas interações.",
        },
        {
            value: "ban",
            title: "Uso proibido",
            icon: ShieldAlert,
            content: `• Spam ou envio excessivo de mensagens
            • Assédio ou ameaças
            • Conteúdo ilegal
            • Conteúdo extremamente ofensivo
            • Tentativas de explorar falhas da plataforma
            • Upload de arquivos maliciosos
            • Uso automatizado não autorizado
        `,
        },
        {
            value: "upload",
            title: "Upload e armazenamento de mídia",
            icon: CloudUpload,
            content:
                "Imagens, vídeos e outros arquivos enviados pelos usuários podem ser armazenados em serviços utilizados pela plataforma. O usuário é responsável pelos arquivos enviados.",
        },
        {
            value: "delete",
            title: "Remoção de conteúdo",
            icon: Trash2 ,
            content:
                "Conteúdos podem ser removidos pela plataforma em caso de violação destes termos. Alguns dados podem permanecer temporariamente armazenados por motivos técnicos, auditoria ou integridade do sistema.",
        },
        {
            value: "service",
            title: "Disponibilidade dos serviços",
            icon: Server,
            content:
                "O serviço pode sofrer interrupções temporárias, manutenções, falhas técnicas ou instabilidades.",
        },
        {
            value: "limitation",
            title: "Alterações nos termos",
            icon: RefreshCcw ,
            content:
                "Os Termos de Serviço podem ser atualizados futuramente. O uso contínuo da plataforma após alterações representa aceitação dos novos termos.",
        },
    ]
}