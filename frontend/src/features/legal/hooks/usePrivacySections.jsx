
import {
    Database,
    Settings,
    Share2,
    ImagePlus,
    KeyRound,
    Shield,
    UserCheck,
    Archive,
    Mail
} from 'lucide-react'

export function usePrivacySections() {

    return [
        {
            value: "collection",
            title: "Informações coletadas",
            icon: Database,
            content: `• Nome de usuário
• Nome de exibição
• Endereço de e-mail
• Senha armazenada de forma protegida
• Foto de perfil
• Bio, localização e site (opcionais)
• Publicações e comentários
• Curtidas e amizades
• Mensagens enviadas no chat
• Arquivos enviados (imagens e vídeos)
• Preferências da conta, como tema e idioma
        `,
        },

        {
            value: "usage",
            title: "Como as informações são utilizadas",
            icon: Settings,
            content: `Os dados coletados são utilizados para:

• Criar e manter contas
• Permitir interações sociais
• Exibir posts, comentários e perfis
• Enviar notificações em tempo real
• Melhorar estabilidade e segurança
• Prevenir abuso da plataforma
        `,
        },

        {
            value: "sharing",
            title: "Compartilhamento de dados",
            icon: Share2,
            content: `Não vendemos informações pessoais dos usuários.

Alguns dados podem ser processados por serviços utilizados pela plataforma,
como hospedagem, banco de dados e armazenamento de mídia.
        `,
        },

        {
            value: "storage",
            title: "Armazenamento de mídia",
            icon: ImagePlus,
            content: `Imagens, vídeos e arquivos enviados pelos usuários
podem ser armazenados em serviços externos utilizados pela plataforma.
        `,
        },

        {
            value: "auth",
            title: "Cookies e autenticação",
            icon: KeyRound,
            content: `A plataforma pode utilizar cookies, tokens ou tecnologias semelhantes
para manter sessões autenticadas e melhorar a experiência do usuário.
        `,
        },

        {
            value: "security",
            title: "Segurança",
            icon: Shield,
            content: `Adotamos medidas razoáveis para proteger informações dos usuários,
mas nenhum sistema é completamente seguro.
        `,
        },

        {
            value: "rights",
            title: "Direitos do usuário",
            icon: UserCheck,
            content: `O usuário pode editar ou remover conteúdos publicados,
além de solicitar exclusão da conta quando disponível.
        `,
        },

        {
            value: "retention",
            title: "Retenção de dados",
            icon: Archive,
            content: `Alguns conteúdos podem permanecer armazenados temporariamente
mesmo após remoção, por motivos técnicos, auditoria ou integridade do sistema.
        `,
        },

        {
            value: "contact",
            title: "Contato",
            icon: Mail,
            content: `Para dúvidas relacionadas à privacidade:

contato@videa.com
        `,
        },
    ]
}