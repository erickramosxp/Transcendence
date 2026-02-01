import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "../shared/components/Button"
import { Sparkles } from "lucide-react"


export function Home() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#edf2f8] via-[#b7c9e1] to-[#9fb8d9]">

            {/* Background Gradient Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#6e93c4]/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#6e93c4]/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#6e93c4]/20 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            {/*Main Section */}
            <div className="relative container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-6">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6e93c4] via-[#4a78b5] to-[#3b6091] shadow-2xl shadow-[#4a78b5]/50 rotate-6 hover:rotate-12 transition-transform mx-auto">
                            <Sparkles className="h-12 w-12 text-white" />
                        </div>
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-[#4a78b5] via-[#3b6091] to-[#2c486d] bg-clip-text text-transparent">
                            Videa
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Conectando ideias, rede social sabor twitter.            </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                            <Button
                                size="lg"
                                onClick={() => navigate('/signup')}
                                className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d] shadow-xl shadow-[#4a78b5]/30 hover:shadow-2xl hover:shadow-[#4a78b5]/40 hover:-translate-y-1 transition-all"
                            >
                                Começar Agora
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-[#4a78b5] text-[#4a78b5] hover:bg-gradient-to-r hover:from-[#edf2f8] hover:via-[#dbe4f0] hover:to-[#b7c9e1] hover:text-[#3b6091] dark:border-[#6e93c4] dark:text-[#6e93c4] dark:hover:from-[#0f1824]/50 dark:hover:via-[#1e3048]/50 dark:hover:to-[#2c486d]/50 hover:border-[#3b6091] dark:hover:border-[#92aed3] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Fazer Login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
