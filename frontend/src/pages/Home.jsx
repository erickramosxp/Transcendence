import { useNavigate } from "react-router-dom"
import { useState } from 'react'
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button.jsx"
import { Card, CardContent } from "../components/ui/Card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs.jsx"
import { ThemeToggle } from "../components/ThemeToggle.jsx"
import { Label } from "../components/ui/Label.jsx"
import { Input } from "../components/ui/Input.jsx"
import { Separator } from "../components/ui/Separator.jsx"
import { LanguageSwitcher } from "../components/LanguageSwitcher.jsx"

import {
    Sparkles,
    Users,
    MessageCircle,
    Heart,
    Shield,
    Mail,
    Lock,
    User,
    ArrowRight
} from "lucide-react"


export function Home() {
    const navigate = useNavigate();
    const [isHoveredCard, setIsHoveredCard] = useState(null);


    const features = [
        {
            icon: Users,
            title: 'Conecte-se',
            description: 'Faça amigos e expanda sua rede social',
            color: 'from-[#6e93c4] to-[#4a78b5]',
        },
        {
            icon: MessageCircle,
            title: 'Converse',
            description: 'Chat em tempo real com chamadas de voz',
            color: 'from-[#4a78b5] to-[#3b6091]',
        },
        {
            icon: Heart,
            title: 'Compartilhe',
            description: 'Publique momentos e interaja com amigos',
            color: 'from-[#3b6091] to-[#2c486d]',
        },
        {
            icon: Shield,
            title: 'Seguro',
            description: 'Seus dados sempre protegidos',
            color: 'from-[#2c486d] to-[#1e3048]',
        },
    ];
    const handleLogin = (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error('Preencha todos os campos');
            return;
        }
        toast.success('Login realizado com sucesso!');
        setTimeout(() => navigate('/feed'), 1000);
    };

    const handleSignup = (e) => {
        e.preventDefault();
        if (!signupName || !signupEmail || !signupPassword) {
            toast.error('Preencha todos os campos');
            return;
        }
        toast.success('Conta criada com sucesso!');
        setTimeout(() => navigate('/feed'), 1000);
    };

    const handleGoogleAuth = () => {
        toast.info('Autenticação com Google em desenvolvimento');
        // implementar integração com Google OAuth
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1] dark:from-slate-950 dark:via-[#0f1824] dark:to-[#1e3048] overflow-hidden relative">

            {/* Top Bar - Language & Theme Switchers */}
            <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100]">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl p-1.5 shadow-lg border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-1">
                    <ThemeToggle compact={true} />
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                    <LanguageSwitcher compact={true} />
                </div>
            </div>

            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#6e93c4]/20 to-[#92aed3]/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-[#6e93c4]/20 to-[#92aed3]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#92aed3]/10 to-[#6e93c4]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="relative min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8" >
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center py-20 sm:py-24 lg:py-12">
                        {/* Apresentação do Lado Esquerdo */}
                        <div className="flex flex-col justify-center space-y-8 lg:space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6e93c4] via-[#4a78b5] to-[#3b6091] shadow-2xl shadow-[#4a78b5]/50 rotate-6 hover:rotate-12 transition-transform">
                                    <Sparkles className="w-8 h-8 sm:h-10 sm:w-10 text-white" />
                                </div>

                                {/* Nome */}
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-[#4a78b5] via-[#3b6091] to-[#2c486d] bg-clip-text text-transparent">
                                    Videa
                                </h1>

                                {/* Slogan */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                    Conectando ideias, rede social sabor twitter.
                                </p>

                            </div>
                            {/* Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    const isHovered = isHoveredCard === index;

                                    return (
                                        <Card
                                            key={index}
                                            onMouseEnter={() => setIsHoveredCard(index)}
                                            onMouseLeave={() => setIsHoveredCard(null)}
                                            className={`border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 cursor-pointer ${isHovered
                                                ? 'shadow-2xl -translate-y-2 scale-105'
                                                : 'shadow-lg hover:shadow-xl'
                                                }`}
                                        >
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div
                                                        className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transition-all duration-300 flex-shrink-0 ${isHovered ? 'scale-110 rotate-12' : ''
                                                            } `}
                                                    >
                                                        <Icon className="h-5 w-5 sm:h-7 sm:w-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-xs sm:text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Lado Direito - Autenticação */}
                        <div className="flex items-center justify-center lg:min-h-screen lg:pt-16">
                            <Card className="w-full max-w-md border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl mt-16 lg:mt-0">
                                <CardContent className="p-6 sm:p-8">
                                    <Tabs defaultValue="login" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
                                            <TabsTrigger value="login" className="text-sm sm:text-base">
                                                Entrar
                                            </TabsTrigger>
                                            <TabsTrigger value="signup" className="text-sm sm:text-base">
                                                Cadastrar
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Formulario Login */}
                                        <TabsContent value="login">
                                            <form className="space-y-5 sm:space-y-6">
                                                <div className="text-center mb-4 sm:mb-6">
                                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                        Bem-vindo de volta!
                                                    </h2>
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                        Entre na sua conta para continuar.
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="login-email" className="text-slate-700 dark:text-slate-300 text-sm">
                                                            <Mail className="h-4 w-4" />
                                                            Email
                                                        </Label>
                                                        <Input
                                                            id="login-email"
                                                            type="email"
                                                            placeholder="Digite seu email"
                                                            // value={loginEmail}
                                                            onChange={(e) => {/* setLoginEmail(e.target.value); */ }}
                                                            className="h-10 sm:h-11"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-300 text-sm">
                                                            <Lock className="h-4 w-4" />
                                                            Senha
                                                        </Label>
                                                        <Input
                                                            id="login-password"
                                                            type="password"
                                                            placeholder="Digite sua senha"
                                                            // value={loginPassword}
                                                            onChange={(e) => {/* setLoginPassword(e.target.value); */ }}
                                                            className="h-10 sm:h-11"
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d] shadow-lg shadow-[#4a78b5]/30 hover:shadow-xl transition-all"
                                                >
                                                    Entrar
                                                </Button>

                                                <div className="relative my-5 sm:my-6">
                                                    <Separator />
                                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm text-slate-500">
                                                        ou
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGoogleAuth}
                                                    className="w-full h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                                >
                                                    <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                                        <path
                                                            fill="currentColor"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">Continuar com Google</span>
                                                </Button>
                                            </form>
                                        </TabsContent>

                                        {/* Formulario Cadastro */}
                                        <TabsContent value="signup">
                                            <form className="space-y-5 sm:space-y-6">
                                                <div className="text-center mb-4 sm:mb-6">
                                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                        Crie sua conta
                                                    </h2>
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                        Junte-se à nossa comunidade
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="signup-name" className="text-slate-700 dark:text-slate-300 text-sm">
                                                            <User className="h-4 w-4" />
                                                            Nome
                                                        </Label>
                                                        <Input
                                                            id="signup-name"
                                                            type="text"
                                                            placeholder="Seu nome completo"
                                                            // value={signupName}
                                                            // onChange={(e) => setSignupName(e.target.value)}
                                                            className="h-10 sm:h-11"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 text-sm">
                                                        <Mail className="h-4 w-4" />
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="signup-email"
                                                        type="email"
                                                        placeholder="seu@email.com"
                                                        // value={signupEmail}
                                                        // onChange={(e) => setSignupEmail(e.target.value)}
                                                        className="h-10 sm:h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300 text-sm">
                                                        <Lock className="h-4 w-4" />
                                                        Senha
                                                    </Label>
                                                    <Input
                                                        id="signup-password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        // value={signupPassword}
                                                        // onChange={(e) => setSignupPassword(e.target.value)}
                                                        className="h-10 sm:h-11"
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d] shadow-lg shadow-[#4a78b5]/30 hover:shadow-xl transition-all"
                                                >
                                                    Criar Conta
                                                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                </Button>

                                                <div className="relative my-5 sm:my-6">
                                                    <Separator />
                                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm text-slate-500">
                                                        ou
                                                    </span>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGoogleAuth}
                                                    className="w-full h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                                >
                                                    <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                                        <path
                                                            fill="currentColor"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        />
                                                        <path
                                                            fill="currentColor"
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">Cadastrar com Google</span>
                                                </Button>
                                            </form>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
