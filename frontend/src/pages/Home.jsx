import {
    Users,
    MessageCircle,
    Heart,
    Shield,
} from "lucide-react"

import { FeatureCard } from '@/design-system/components/FeatureCard'
import { AuthContainer } from "@/features/auth/AuthContainer"
import { BgAnimated } from '@/design-system/components/BgAnimated'
import { BrandHeader } from "@/design-system/components/BrandHeader"
import { TopBar } from "@/design-system/components/TopBar"
import { useTranslation } from "react-i18next"

export function Home() {

    const { t } = useTranslation('home');


    const features = [
        {
            icon: Users,
            title: t('features.connect.title'),
            description: t('features.connect.description'),
            gradient: "bg-gradient-connect",
        },
        {
            icon: MessageCircle,
            title: t('features.chat.title'),
            description: t('features.chat.description'),
            gradient: "bg-gradient-chat",
        },
        {
            icon: Heart,
            title: t('features.share.title'),
            description: t('features.share.description'),
            gradient: "bg-gradient-share",
        },
        {
            icon: Shield,
            title: t('features.secure.title'),
            description: t('features.secure.description'),
            gradient: "bg-gradient-secure",
        },
    ];

    return (
        <div className="min-h-screen overflow-hidden relative">

            {/* Top Bar - Language & Theme Switchers */}
            <TopBar />
            {/* Animated background */}
            <BgAnimated />

            <div className="relative min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8" >
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center py-20 sm:py-24 lg:py-12">

                        {/* Apresentação do Lado Esquerdo */}
                        <div className="flex flex-col justify-center space-y-8 lg:space-y-12">
                            <BrandHeader size="lg" slogan={t('brand.slogan')}/>
                            {/* Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, index) => (
                                    <FeatureCard 
                                        key={index}
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.description}
                                        gradient={feature.gradient}
                                    />
                                ))}
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
