import { useEffect, useState } from "react";
import { updateUserTheme } from "@/shared/api/preferencesService";

export function useTheme() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const initialTheme =
            savedTheme || (systemPrefersDark ? "dark" : "light");

        setTheme(initialTheme);
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }, []);

    const changeTheme = async (nextTheme) => {
        const currentTheme = theme;
        setTheme(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        localStorage.setItem("theme", nextTheme);

        if (localStorage.getItem("@trascendence:token") && nextTheme != currentTheme) {
            try {
                await updateUserTheme({ theme: nextTheme });
            } catch (e) {
                console.error("Erro ao salvar tema");
            }
        }
    };

    const toggleTheme = async () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        await changeTheme(nextTheme);
    };

    return {
        currentTheme: theme,
        isDark: theme === "dark",
        changeTheme,
        toggleTheme,
    };
}