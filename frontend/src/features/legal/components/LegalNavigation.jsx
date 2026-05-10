import { useLocation, useNavigate } from "react-router-dom"

import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/design-system"
import { useTranslation } from "react-i18next"

export function LegalNavigation() {
    const { t } = useTranslation('legalNavigation');
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
                <TabsTrigger value="terms">
                    {t('terms')}
                </TabsTrigger>
                
                <TabsTrigger value="privacy">
                    {t('privacy')}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}