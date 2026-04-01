// src/shared/hooks/useLanguage.js
import i18n from "@/i18n";
import { updateUserLanguage } from "@/shared/api/preferencesService";

export function useLanguage() {
    
    const changeLanguage = async (lang) => {

        const originLanguage = i18n.language;
        // muda na UI
        i18n.changeLanguage(lang);

        // salva local
        localStorage.setItem("lang", lang);

        // salva no backend (se logado)
        if (localStorage.getItem('@trascendence:token')
            && lang != originLanguage
        ) {
            // salva no backend (se logado)
            try {
                await updateUserLanguage({language: lang})
            } catch (e) {
                console.error("Erro ao salvar idioma");
            }
        }
    };

    return {
        currentLanguage: i18n.language,
        changeLanguage,
    };
}