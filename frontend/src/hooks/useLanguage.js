// src/shared/hooks/useLanguage.js
import i18n from "@/i18n";

export function useLanguage() {
    
    const changeLanguage = async (lang) => {
        // muda na UI
        i18n.changeLanguage(lang);

        // salva local
        localStorage.setItem("lang", lang);

        // salva no backend (se logado)
        // try {
        //     await fetch("/api/users/language", {
        //         method: "PUT",
        //         body: JSON.stringify({ language: lang }),
        //     });
        // } catch (e) {
        //     console.error("Erro ao salvar idioma");
        // }
    };

    return {
        currentLanguage: i18n.language,
        changeLanguage,
    };
}