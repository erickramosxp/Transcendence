import { useMemo, useState } from "react";
import {
  Sparkles,
  Users,
  MessageCircle,
  Share2,
  Shield,
  Mail,
  Lock,
} from "lucide-react";

import {
  BgAnimated,
  BrandHeader,
  FeatureCard,
  LanguageSwitcher,
  Loading,
  Media,
  Modal,
  ThemeToggle,
  TopBar,
} from "@/design-system";

import {
  Avatar,
  AvatarWithStatus,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FileUploadButton,
  Input,
  Label,
  Scroll,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextWithLink,
} from "@/design-system";

function ExplainItem({ classNameValue, explanation }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="font-mono text-sm text-primary break-all">{classNameValue}</p>
      <p className="mt-1 text-sm text-muted-foreground">{explanation}</p>
    </div>
  );
}

function ComponentDoc({
  title,
  componentTag,
  description,
  classes = [],
  children,
}) {
  return (
    <Card className="border-border bg-card/90 backdrop-blur-xl shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {componentTag}
          </span>
        </div>

        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          {children}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Explicação das classes
          </h4>

          <div className="grid gap-3">
            {classes.map((item, index) => (
              <ExplainItem
                key={`${componentTag}-${index}`}
                classNameValue={item.classNameValue}
                explanation={item.explanation}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferencedOnlyCard({ name, usage, notes = [] }) {
  return (
    <Card className="border-dashed border-border bg-card/70">
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription>{usage}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Esse componente foi citado no arquivo, mas a implementação completa não
          apareceu no trecho anexado.
        </div>

        {notes.map((note, index) => (
          <div
            key={`${name}-${index}`}
            className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground"
          >
            {note}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ThemeShowcase() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState("");

  const featureExamples = useMemo(
    () => [
      {
        icon: Users,
        title: "Conecte-se",
        description:
          "Faça novas amizades e acompanhe pessoas com interesses parecidos.",
        gradient: "bg-gradient-connect",
      },
      {
        icon: MessageCircle,
        title: "Converse",
        description:
          "Troque mensagens e participe de interações em tempo real.",
        gradient: "bg-gradient-chat",
      },
      {
        icon: Share2,
        title: "Compartilhe",
        description:
          "Publique fotos, vídeos e ideias com a sua comunidade.",
        gradient: "bg-gradient-share",
      },
      {
        icon: Shield,
        title: "Seguro",
        description: "Controle melhor sua privacidade e proteja sua conta.",
        gradient: "bg-gradient-secure",
      },
    ],
    []
  );

  const documentedReferences = [
    {
      name: "<NotificationItem />",
      usage:
        "Esse componente foi descrito como item de notificações com variantes like, comment e follow.",
      notes: [
        'Uso citado no arquivo: variant="like | comment | follow".',
        "Também foi citado com props user, timestamp e unread.",
      ],
    },
    {
      name: "<PostCard />",
      usage:
        "Esse componente foi descrito como card de post usado no Feed e no Perfil.",
      notes: [
        "Foi citado com props author, content, likes, comments e timestamp.",
      ],
    },
    {
      name: "<SidebarNav />",
      usage:
        "Esse componente foi descrito como navegação lateral das telas internas.",
      notes: [
        'Foi citado com activeItem="feed | messages | notifications | friends | profile".',
      ],
    },
    {
      name: "<UserListItem />",
      usage:
        "Esse componente foi descrito para Chat, Amigos e online users da sidebar.",
      notes: [
        'Foi citado com variant="chat | friend | online", além de user, meta e online.',
      ],
    },
    {
      name: "<Badge />",
      usage:
        "Esse componente foi citado como unread badge com variante count ou dot.",
      notes: [
        'Foi citado com variant="count | dot".',
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <BgAnimated />
      <TopBar />

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Theme Showcase Explicado
          </div>

          <BrandHeader
            size="default"
            slogan="Cada bloco mostra o componente, para que ele serve e o que cada classe Tailwind faz."
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">App components</h2>

          <div className="grid gap-6">
            <ComponentDoc
              title="Feature card"
              componentTag="<FeatureCard />"
              description="Esse componente <FeatureCard /> serve para destacar benefícios da aplicação com ícone, título e descrição."
              classes={[
                {
                  classNameValue: "group",
                  explanation:
                    "Essa classe permite que elementos filhos reajam ao hover do card inteiro.",
                },
                {
                  classNameValue: "border-border",
                  explanation:
                    "Essa classe usa a borda do tema, então o card sempre respeita o design system.",
                },
                {
                  classNameValue: "bg-card/90",
                  explanation:
                    "Essa classe aplica o fundo de card com leve transparência.",
                },
                {
                  classNameValue: "backdrop-blur-xl",
                  explanation:
                    "Essa classe cria o efeito de vidro fosco atrás do card.",
                },
                {
                  classNameValue: "cursor-pointer",
                  explanation:
                    "Essa classe indica que o card pode ser interativo.",
                },
                {
                  classNameValue: "transition-all duration-300",
                  explanation:
                    "Essas classes suavizam as mudanças de hover e animações.",
                },
                {
                  classNameValue: "shadow-md hover:shadow-xl",
                  explanation:
                    "Essas classes deixam o card com sombra base e mais profundidade no hover.",
                },
                {
                  classNameValue: "hover:-translate-y-1",
                  explanation:
                    "Essa classe faz o card subir levemente no hover.",
                },
                {
                  classNameValue: "hover:scale-[1.02]",
                  explanation:
                    "Essa classe aumenta um pouco o card para reforçar interação.",
                },
                {
                  classNameValue:
                    "group-hover:scale-110 group-hover:rotate-12",
                  explanation:
                    "Essas classes fazem o bloco do ícone crescer e girar quando o card recebe hover.",
                },
              ]}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featureExamples.map((item) => (
                  <FeatureCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    gradient={item.gradient}
                  />
                ))}
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Brand header"
              componentTag="<BrandHeader />"
              description="Esse componente <BrandHeader /> serve para mostrar a identidade da marca com logo, nome e slogan."
              classes={[
                {
                  classNameValue: "flex flex-col space-y-6",
                  explanation:
                    "Essas classes organizam logo, nome e slogan em coluna com espaçamento vertical.",
                },
                {
                  classNameValue: "inline-flex items-center justify-center",
                  explanation:
                    "Essas classes centralizam o ícone dentro do bloco do logo.",
                },
                {
                  classNameValue: "rounded-3xl",
                  explanation:
                    "Essa classe cria um arredondamento mais marcante no logo.",
                },
                {
                  classNameValue: "bg-gradient-sparkle",
                  explanation:
                    "Essa classe aplica o gradiente principal da marca no fundo do logo.",
                },
                {
                  classNameValue: "shadow-2xl shadow-primary/50",
                  explanation:
                    "Essas classes criam sombra forte usando a cor primária como base.",
                },
                {
                  classNameValue: "rotate-6 hover:rotate-12 transition-transform",
                  explanation:
                    "Essas classes inclinam o logo e aumentam o movimento no hover.",
                },
                {
                  classNameValue: "bg-gradient-title bg-clip-text text-transparent",
                  explanation:
                    "Essas classes fazem o gradiente aparecer dentro do texto do nome da marca.",
                },
                {
                  classNameValue: "text-muted-foreground leading-relaxed max-w-xl",
                  explanation:
                    "Essas classes deixam o slogan mais suave e confortável de ler.",
                },
              ]}
            >
              <div className="space-y-8">
                <BrandHeader size="sm" slogan="Versão compacta" />
                <Separator />
                <BrandHeader size="default" slogan="Versão principal" />
                <Separator />
                <BrandHeader size="lg" slogan="Versão de destaque" />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Bg animated"
              componentTag="<BgAnimated />"
              description="Esse componente <BgAnimated /> serve para criar o fundo decorativo com blobs e gradientes animados."
              classes={[
                {
                  classNameValue: "absolute inset-0",
                  explanation:
                    "Essas classes fazem o fundo ocupar toda a área do container pai.",
                },
                {
                  classNameValue: "overflow-hidden",
                  explanation:
                    "Essa classe evita que os blobs vazem para fora da área visível.",
                },
                {
                  classNameValue: "pointer-events-none",
                  explanation:
                    "Essa classe impede que o fundo capture cliques.",
                },
                {
                  classNameValue: "rounded-full",
                  explanation:
                    "Essa classe transforma os blocos em círculos.",
                },
                {
                  classNameValue: "blur-3xl",
                  explanation:
                    "Essa classe deixa os círculos bem difusos para parecer luz ambiente.",
                },
                {
                  classNameValue: "animate-pulse",
                  explanation:
                    "Essa classe aplica uma pulsação suave nos elementos decorativos.",
                },
              ]}
            >
              <div className="relative h-52 overflow-hidden rounded-2xl border border-border bg-gradient-main">
                <BgAnimated />
                <div className="relative z-10 flex h-full items-center justify-center">
                  <span className="rounded-full bg-card/80 px-4 py-2 text-sm backdrop-blur">
                    Fundo animado da interface
                  </span>
                </div>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Language switcher"
              componentTag="<LanguageSwitcher />"
              description="Esse componente <LanguageSwitcher /> serve para alternância visual de idioma usando um botão com ícone."
              classes={[
                {
                  classNameValue: 'variant="ghost" size="icon"',
                  explanation:
                    "Essas props reaproveitam o estilo ghost do Button com tamanho quadrado para ícone.",
                },
                {
                  classNameValue: "relative",
                  explanation:
                    "Essa classe permite posicionar as bandeiras com absolute dentro do botão.",
                },
                {
                  classNameValue: "absolute -top-1 -right-1 text-xs",
                  explanation:
                    "Essas classes posicionam as bandeirinhas no canto superior do botão.",
                },
              ]}
            >
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <p className="text-sm text-muted-foreground">
                  Botão de idioma em formato compacto.
                </p>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Loading"
              componentTag="<Loading />"
              description="Esse componente <Loading /> serve para mostrar estados de carregamento inline ou cobrindo um container."
              classes={[
                {
                  classNameValue: "flex items-center justify-center",
                  explanation:
                    "Essas classes centralizam o spinner no modo normal.",
                },
                {
                  classNameValue: "absolute inset-0",
                  explanation:
                    "Essas classes fazem o loading ocupar todo o container pai no modo full.",
                },
                {
                  classNameValue: "animate-spin",
                  explanation:
                    "Essa classe faz o ícone girar continuamente.",
                },
                {
                  classNameValue: "h-6 w-6 / h-8 w-8 / h-12 w-12 / h-16 w-16",
                  explanation:
                    "Essas classes definem os tamanhos sm, md, lg e xl.",
                },
              ]}
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <Loading size="sm" />
                  <Loading size="md" />
                  <Loading size="lg" />
                  <Loading size="xl" />
                </div>

                <div className="relative h-28 rounded-2xl border border-border bg-muted/40">
                  <Loading full />
                </div>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Media"
              componentTag="<Media />"
              description="Esse componente <Media /> serve para detectar e renderizar imagem ou vídeo com base na URL e no mimeType."
              classes={[
                {
                  classNameValue: "animate-pulse bg-gray-300 h-64 w-full rounded-lg",
                  explanation:
                    "Essas classes formam o placeholder de loading enquanto o tipo da mídia ainda não foi resolvido.",
                },
                {
                  classNameValue: "rounded-lg",
                  explanation:
                    "Essa classe arredonda a mídia renderizada.",
                },
                {
                  classNameValue: "mt-3 max-w-xl w-full",
                  explanation:
                    "Essas classes controlam espaçamento e largura do vídeo.",
                },
              ]}
            >
              <div className="space-y-4">
                <Media
                  url="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop"
                  mimeType="image/jpeg"
                />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Modal"
              componentTag="<Modal />"
              description="Esse componente <Modal /> serve para abrir conteúdo em overlay, com fechamento por clique fora e tecla Escape."
              classes={[
                {
                  classNameValue: "fixed inset-0 z-50",
                  explanation:
                    "Essas classes fazem o modal cobrir a tela inteira e ficar acima do restante da interface.",
                },
                {
                  classNameValue: "flex items-center justify-center",
                  explanation:
                    "Essas classes centralizam a caixa do modal na tela.",
                },
                {
                  classNameValue: "bg-black/40",
                  explanation:
                    "Essa classe cria o escurecimento do fundo.",
                },
                {
                  classNameValue: "backdrop-blur-sm",
                  explanation:
                    "Essa classe desfoca levemente o fundo atrás do modal.",
                },
                {
                  classNameValue: "bg-card text-foreground rounded-xl border border-border",
                  explanation:
                    "Essas classes aplicam o visual padrão do design system à caixa do modal.",
                },
                {
                  classNameValue: "shadow-2xl",
                  explanation:
                    "Essa classe dá profundidade forte ao modal.",
                },
                {
                  classNameValue: "animate-in slide-in-from-bottom-4 duration-300",
                  explanation:
                    "Essas classes fazem o modal entrar com animação suave.",
                },
                {
                  classNameValue: "overflow-y-auto",
                  explanation:
                    "Essa classe permite rolagem interna quando o conteúdo é grande.",
                },
              ]}
            >
              <div className="space-y-4">
                <Button onClick={() => setOpenModal(true)}>Abrir modal</Button>
                <p className="text-sm text-muted-foreground">
                  Clique para testar overlay e scroll interno.
                </p>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Theme toggle"
              componentTag="<ThemeToggle />"
              description="Esse componente <ThemeToggle /> serve para alternar entre tema claro e escuro usando o Button como base."
              classes={[
                {
                  classNameValue: 'variant="ghost" size="icon"',
                  explanation:
                    "Essas props usam o visual ghost e o formato compacto de ícone.",
                },
                {
                  classNameValue: "h-9 w-9 rounded-lg",
                  explanation:
                    "Essas classes padronizam o tamanho do botão compacto.",
                },
                {
                  classNameValue: "hover:bg-slate-100 dark:hover:bg-slate-800",
                  explanation:
                    "Essas classes ajustam o hover no modo claro e no modo escuro.",
                },
                {
                  classNameValue: "transition-colors",
                  explanation:
                    "Essa classe suaviza a troca de cor no hover.",
                },
              ]}
            >
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <ThemeToggle compact />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Top bar"
              componentTag="<TopBar />"
              description="Esse componente <TopBar /> serve para fixar ThemeToggle e LanguageSwitcher no canto superior da tela."
              classes={[
                {
                  classNameValue: "fixed top-4 right-4 sm:top-6 sm:right-6 z-[100]",
                  explanation:
                    "Essas classes fixam a barra no topo direito com ajuste responsivo.",
                },
                {
                  classNameValue: "bg-card/95 backdrop-blur-xl",
                  explanation:
                    "Essas classes criam o visual de glass com fundo de card quase opaco.",
                },
                {
                  classNameValue: "rounded-md p-1.5 shadow-lg border border-border",
                  explanation:
                    "Essas classes definem borda, espaçamento e profundidade da barra.",
                },
                {
                  classNameValue: "flex items-center gap-1",
                  explanation:
                    "Essas classes alinham os controles em linha.",
                },
              ]}
            >
              <div className="relative h-28 rounded-2xl border border-border bg-muted/30">
                <TopBar className="absolute right-4 top-4" />
              </div>
            </ComponentDoc>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Primitives</h2>

          <div className="grid gap-6">
            <ComponentDoc
              title="Avatar"
              componentTag="<Avatar />"
              description="Esse componente <Avatar /> serve para mostrar foto de usuário ou fallback com iniciais."
              classes={[
                {
                  classNameValue: "relative flex items-center justify-center",
                  explanation:
                    "Essas classes centralizam o conteúdo dentro do avatar.",
                },
                {
                  classNameValue: "border rounded-full",
                  explanation:
                    "Essas classes criam a forma circular do avatar.",
                },
                {
                  classNameValue: "bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091]",
                  explanation:
                    "Essas classes aplicam o gradiente azul usado como fallback visual.",
                },
                {
                  classNameValue: "font-medium overflow-hidden",
                  explanation:
                    "Essas classes deixam as iniciais legíveis e cortam a imagem corretamente.",
                },
                {
                  classNameValue: "h-8 w-8 / h-10 w-10 / h-14 w-14 ...",
                  explanation:
                    "Essas classes controlam os tamanhos disponíveis do avatar.",
                },
              ]}
            >
              <div className="flex flex-wrap items-end gap-4">
                <Avatar name="Maria Silva" size="sm" />
                <Avatar name="Maria Silva" size="md" />
                <Avatar name="Maria Silva" size="lg" />
                <Avatar name="Maria Silva" size="xl" />
                <Avatar name="Maria Silva" size="xxl" />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Avatar with status"
              componentTag="<AvatarWithStatus />"
              description="Esse componente <AvatarWithStatus /> serve para adicionar badge de status no canto do avatar."
              classes={[
                {
                  classNameValue: "relative inline-block",
                  explanation:
                    "Essa classe cria a referência para posicionar o status.",
                },
                {
                  classNameValue: "absolute bottom-0 right-0",
                  explanation:
                    "Essas classes colocam o status no canto inferior direito.",
                },
                {
                  classNameValue: "rounded-full border-2 border-white",
                  explanation:
                    "Essas classes deixam o status circular e com separação visual do avatar.",
                },
                {
                  classNameValue: "bg-green-500 / bg-gray-400 / bg-red-500",
                  explanation:
                    "Essas classes representam status online, offline e ocupado.",
                },
              ]}
            >
              <div className="flex flex-wrap items-end gap-6">
                <AvatarWithStatus name="João Pedro" size="sm" status="online" />
                <AvatarWithStatus name="Ana Costa" size="md" status="offline" />
                <AvatarWithStatus name="Carlos Lima" size="lg" status="busy" />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Button"
              componentTag="<Button />"
              description="Esse componente <Button /> serve como base de ação da interface e possui variantes primary, outline, secondary, ghost, nav-active, destructive e link."
              classes={[
                {
                  classNameValue:
                    "inline-flex items-center justify-center gap-2",
                  explanation:
                    "Essas classes alinham conteúdo e ícone dentro do botão.",
                },
                {
                  classNameValue: "font-medium transition-all",
                  explanation:
                    "Essas classes garantem peso visual consistente e transições suaves.",
                },
                {
                  classNameValue:
                    "focus-visible:ring-2 focus-visible:ring-ring",
                  explanation:
                    "Essas classes mostram foco acessível quando o botão é navegado por teclado.",
                },
                {
                  classNameValue:
                    "bg-gradient-btn-primary text-primary-foreground shadow-btn-primary",
                  explanation:
                    "Essas classes formam o visual da variante primary.",
                },
                {
                  classNameValue: "hover:bg-gradient-btn-primary-hover",
                  explanation:
                    "Essa classe intensifica o gradiente do botão principal no hover.",
                },
                {
                  classNameValue:
                    "border border-border bg-transparent text-foreground hover:bg-accent",
                  explanation:
                    "Essas classes formam a variante outline.",
                },
                {
                  classNameValue:
                    "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                  explanation:
                    "Essas classes formam a variante ghost.",
                },
                {
                  classNameValue:
                    "bg-destructive border border-border text-primary-foreground",
                  explanation:
                    "Essas classes formam a variante destructive.",
                },
                {
                  classNameValue:
                    "h-10 px-4 py-2 rounded-md / h-8 px-3 rounded-lg / h-9 w-9 rounded-lg",
                  explanation:
                    "Essas classes definem os tamanhos default, sm e icon.",
                },
              ]}
            >
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Card"
              componentTag="<Card />"
              description="Esse componente <Card /> serve como contêiner base do design system para blocos de conteúdo."
              classes={[
                {
                  classNameValue: "bg-card text-card-foreground",
                  explanation:
                    "Essas classes aplicam o fundo e a cor de texto do card segundo o tema.",
                },
                {
                  classNameValue: "flex flex-col gap-6",
                  explanation:
                    "Essas classes organizam o conteúdo do card em coluna com espaçamento.",
                },
                {
                  classNameValue: "rounded-xl border",
                  explanation:
                    "Essas classes definem a forma visual padrão do card.",
                },
                {
                  classNameValue: "px-6 pt-6 pb-6",
                  explanation:
                    "Essas classes aparecem nas partes internas como Header, Content e Footer para espaçamento consistente.",
                },
              ]}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Exemplo de Card</CardTitle>
                  <CardDescription>
                    Esse card mostra a estrutura base do design system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Conteúdo principal do card.
                  </p>
                </CardContent>
              </Card>
            </ComponentDoc>

            <ComponentDoc
              title="File upload button"
              componentTag="<FileUploadButton />"
              description="Esse componente <FileUploadButton /> serve para abrir o seletor de arquivos com um botão compacto."
              classes={[
                {
                  classNameValue: "hidden",
                  explanation:
                    "Essa classe esconde o input file nativo.",
                },
                {
                  classNameValue: "h-8 w-8 sm:h-9 sm:w-9 p-0",
                  explanation:
                    "Essas classes deixam o botão pequeno e quadrado para ícone.",
                },
                {
                  classNameValue: "text-[#4a78b5]",
                  explanation:
                    "Essa classe aplica a cor azul do ícone de upload.",
                },
              ]}
            >
              <div className="flex items-center gap-4">
                <FileUploadButton onFileSelect={setSelectedFile} />
                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
                </span>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Input"
              componentTag="<Input />"
              description="Esse componente <Input /> serve para entradas de texto e usa uma base de classes centralizada em inputBase."
              classes={[
                {
                  classNameValue: "flex h-10 sm:h-11 w-full min-w-0 px-3 py-2",
                  explanation:
                    "Essas classes definem layout, altura e espaçamento interno do campo.",
                },
                {
                  classNameValue: "rounded-lg border border-border",
                  explanation:
                    "Essas classes criam a forma do input e usam a borda do tema.",
                },
                {
                  classNameValue: "bg-input-background",
                  explanation:
                    "Essa classe usa o fundo específico de campos de formulário.",
                },
                {
                  classNameValue:
                    "text-sm text-foreground placeholder:text-muted-foreground",
                  explanation:
                    "Essas classes ajustam a tipografia do valor e do placeholder.",
                },
                {
                  classNameValue:
                    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                  explanation:
                    "Essas classes destacam o campo no foco.",
                },
                {
                  classNameValue:
                    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
                  explanation:
                    "Essas classes mostram o estado de erro.",
                },
                {
                  classNameValue:
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  explanation:
                    "Essas classes deixam claro quando o campo está desabilitado.",
                },
                {
                  classNameValue:
                    "selection:bg-primary selection:text-primary-foreground",
                  explanation:
                    "Essas classes estilizam a seleção do texto digitado.",
                },
                {
                  classNameValue: "pl-9",
                  explanation:
                    "Essa classe é adicionada quando o input recebe a prop icon.",
                },
              ]}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Label"
              componentTag="<Label />"
              description="Esse componente <Label /> serve para legenda e identificação dos campos de formulário."
              classes={[
                {
                  classNameValue:
                    "flex items-center gap-2 text-sm leading-none font-medium",
                  explanation:
                    "Essas classes alinham e dão peso visual ao texto do label.",
                },
                {
                  classNameValue: "select-none",
                  explanation:
                    "Essa classe evita seleção acidental de texto no label.",
                },
                {
                  classNameValue:
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                  explanation:
                    "Essas classes reagem ao estado disabled do campo relacionado.",
                },
              ]}
            >
              <div className="space-y-2">
                <Label htmlFor="example-label">Nome</Label>
                <Input id="example-label" placeholder="Digite aqui" />
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Scroll"
              componentTag="<Scroll />"
              description="Esse componente <Scroll /> serve para criar uma área rolável usando Radix ScrollArea."
              classes={[
                {
                  classNameValue: "w-full overflow-hidden",
                  explanation:
                    "Essas classes controlam a largura e escondem vazamentos visuais.",
                },
                {
                  classNameValue: "min-h-[80px] max-h-[250px]",
                  explanation:
                    "Essas classes definem a área de viewport rolável.",
                },
                {
                  classNameValue:
                    "bg-slate-200 dark:bg-slate-800",
                  explanation:
                    "Essas classes ajustam a trilha da scrollbar no light e dark mode.",
                },
                {
                  classNameValue: "bg-slate-400 rounded-full",
                  explanation:
                    "Essas classes estilizam o thumb da scrollbar.",
                },
              ]}
            >
              <Scroll className="rounded-xl border border-border p-4">
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-muted/40 p-3 text-sm"
                    >
                      Item rolável {index + 1}
                    </div>
                  ))}
                </div>
              </Scroll>
            </ComponentDoc>

            <ComponentDoc
              title="Separator"
              componentTag="<Separator />"
              description="Esse componente <Separator /> serve para dividir visualmente seções horizontais ou verticais."
              classes={[
                {
                  classNameValue: "bg-border",
                  explanation:
                    "Essa classe usa a cor de borda do tema para o divisor.",
                },
                {
                  classNameValue:
                    "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
                  explanation:
                    "Essas classes definem o comportamento horizontal.",
                },
                {
                  classNameValue:
                    "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
                  explanation:
                    "Essas classes definem o comportamento vertical.",
                },
              ]}
            >
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Bloco de cima</div>
                <Separator />
                <div className="text-sm text-muted-foreground">Bloco de baixo</div>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Tabs"
              componentTag="<Tabs />"
              description="Esse conjunto <Tabs />, <TabsList />, <TabsTrigger /> e <TabsContent /> serve para navegação por abas."
              classes={[
                {
                  classNameValue:
                    "inline-flex h-10 w-full items-center justify-center rounded-md p-1 gap-1",
                  explanation:
                    "Essas classes formam a base visual da lista de abas.",
                },
                {
                  classNameValue: "bg-muted text-muted-foreground",
                  explanation:
                    "Essas classes definem o fundo padrão da lista de abas.",
                },
                {
                  classNameValue:
                    "inline-flex h-8 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
                  explanation:
                    "Essas classes formam cada botão de aba.",
                },
                {
                  classNameValue:
                    "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                  explanation:
                    "Essas classes definem o estado ativo padrão.",
                },
                {
                  classNameValue:
                    "[data-variant=filled]_&:data-[state=active]:bg-primary",
                  explanation:
                    "Essa classe muda a aba ativa para primária quando o variant é filled.",
                },
                {
                  classNameValue:
                    "[data-variant=filled]_&:data-[state=active]:text-primary-foreground",
                  explanation:
                    "Essa classe ajusta a cor do texto da aba ativa no modo filled.",
                },
              ]}
            >
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList variant="filled">
                  <TabsTrigger value="tab1">Geral</TabsTrigger>
                  <TabsTrigger value="tab2">Links</TabsTrigger>
                  <TabsTrigger value="tab3">Texto</TabsTrigger>
                </TabsList>

                <TabsContent value="tab1" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Essa aba mostra o estado ativo preenchido.
                  </p>
                </TabsContent>

                <TabsContent value="tab2" className="mt-4">
                  <TextWithLink
                    text="Acesse https://react.dev e https://tailwindcss.com"
                    className="text-sm"
                  />
                </TabsContent>

                <TabsContent value="tab3" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Conteúdo de demonstração da terceira aba.
                  </p>
                </TabsContent>
              </Tabs>
            </ComponentDoc>

            <ComponentDoc
              title="Textarea"
              componentTag="<Textarea />"
              description="Esse componente <Textarea /> serve para entrada de textos maiores e segue a mesma família visual do Input."
              classes={[
                {
                  classNameValue: "resize-none",
                  explanation:
                    "Essa classe impede resize manual do textarea.",
                },
                {
                  classNameValue: "min-h-16 w-full rounded-md border",
                  explanation:
                    "Essas classes definem altura mínima, largura total e estrutura base.",
                },
                {
                  classNameValue: "bg-input-background px-3 py-2",
                  explanation:
                    "Essas classes aplicam o fundo do campo e o padding interno.",
                },
                {
                  classNameValue:
                    "placeholder:text-muted-foreground",
                  explanation:
                    "Essa classe deixa o placeholder mais suave.",
                },
                {
                  classNameValue:
                    "focus-visible:border-ring focus-visible:ring-[3px]",
                  explanation:
                    "Essas classes reforçam o foco visual do campo.",
                },
                {
                  classNameValue:
                    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
                  explanation:
                    "Essas classes mostram o estado inválido.",
                },
                {
                  classNameValue:
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  explanation:
                    "Essas classes indicam o estado desabilitado.",
                },
              ]}
            >
              <div className="space-y-2">
                <Label htmlFor="bio">Descrição</Label>
                <Textarea
                  id="bio"
                  maxLength={240}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escreva algo sobre você..."
                />
                <p className="text-right text-xs text-muted-foreground">
                  {text.length}/240
                </p>
              </div>
            </ComponentDoc>

            <ComponentDoc
              title="Text with link"
              componentTag="<TextWithLink />"
              description="Esse componente <TextWithLink /> serve para renderizar texto comum com links detectados e estilizados."
              classes={[
                {
                  classNameValue:
                    "text-[#4a78b5] hover:text-[#3b6091]",
                  explanation:
                    "Essas classes aplicam a identidade azul do link e seu hover.",
                },
                {
                  classNameValue: "hover:underline underline-offset-2",
                  explanation:
                    "Essas classes reforçam o estado interativo do link.",
                },
                {
                  classNameValue: "break-all",
                  explanation:
                    "Essa classe quebra URLs longas sem estourar o layout.",
                },
              ]}
            >
              <TextWithLink
                text="Veja também https://perplexity.ai e https://react.dev"
                className="text-sm"
              />
            </ComponentDoc>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Componentes citados no arquivo</h2>
          <p className="text-sm text-muted-foreground">
            Esses nomes aparecem no arquivo, mas a implementação completa não veio no trecho anexado.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documentedReferences.map((item) => (
              <ReferencedOnlyCard
                key={item.name}
                name={item.name}
                usage={item.usage}
                notes={item.notes}
              />
            ))}
          </div>
        </section>
      </main>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Preview do Modal"
        size="lg"
        scrollable
      >
        <div className="space-y-4 p-2 sm:p-4">
          <BrandHeader
            size="sm"
            slogan="Esse modal serve só como preview visual dentro do showcase."
          />
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            {featureExamples.slice(0, 2).map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                gradient={item.gradient}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}