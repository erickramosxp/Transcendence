import { Link } from "react-router-dom"
import { SearchX } from "lucide-react"
import { BrandHeader, Button } from "@/design-system"

export function NotFound() {
    return (
        <>
            <div className="min-h-screen flex-col flex items-center justify-center p-4">
                <BrandHeader size="md" className={'p-5'} />
                <div className="w-full max-w-sm sm:max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">

                    <div className="flex justify-center mb-4">
                        <SearchX
                            size={52}
                            className="text-muted-foreground"
                        />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">
                        404
                    </h1>

                    <p className="text-lg font-medium mb-2">
                        Página não encontrada
                    </p>

                    <p className="text-sm text-muted-foreground mb-6">
                        A página que você tentou acessar não existe
                        ou foi removida.
                    </p>

                    <div className="flex gap-2">
                            <Link
                                to="/feed"
                                className="flex-1 text-primary-foreground bg-primary rounded-sm"
                            >
                                Feed

                            </Link>



                            <Link
                                to="/"
                                className="flex-1 text-primary-foreground bg-primary rounded-sm"
                            >
                                Início
                            </Link>
                    </div>

                </div>
            </div>
        </>
    )
}