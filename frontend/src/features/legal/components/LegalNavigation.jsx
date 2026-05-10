import { useLocation, useNavigate } from "react-router-dom"

import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/design-system"

export function LegalNavigation() {
    const location = useLocation()
    const navigate = useNavigate()

    const currentTab =
        location.pathname === "/legal/terms"
            ? "terms"
            : "privacy"

    return (
        <Tabs
            value={currentTab}
            onValueChange={(value) => {
                navigate(
                    value === "terms"
                        ? "/legal/terms"
                        : "/legal/privacy"
                )
            }}
            className="mt-5 mb-5"
        >
            <TabsList>
                <TabsTrigger value="privacy">
                    Política de Privacidade
                </TabsTrigger>

                <TabsTrigger value="terms">
                    Termos de Serviço
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}