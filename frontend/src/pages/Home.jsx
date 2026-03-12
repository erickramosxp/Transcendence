import { useNavigate } from "react-router-dom"
import { useState } from 'react'
import { Card, CardContent } from "../components/ui/Card.jsx"
import { ThemeToggle } from "../components/ThemeToggle.jsx"
import { LanguageSwitcher } from "../components/LanguageSwitcher.jsx"

import {
    Sparkles,
    Users,
    MessageCircle,
    Heart,
    Shield,
} from "lucide-react"

import { AuthContainer } from "../features/auth/AuthContainer"

export function Home() {
    // const navigate = useNavigate();
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

    // const handleSignup = (e) => {
    //     e.preventDefault();
    //     if (!signupName || !signupEmail || !signupPassword) {
    //         toast.error('Preencha todos os campos');
    //         return;
    //     }
    //     toast.success('Conta criada com sucesso!');
    //     setTimeout(() => navigate('/feed'), 1000);
    // };


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
                        <AuthContainer />
                    </div>
                </div>
            </div>
        </div>
    )
}
