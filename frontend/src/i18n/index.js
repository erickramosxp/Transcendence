import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enFeed from "./locales/en/feed.json";
import enProfile from "./locales/en/profile.json";
import enCommon from "./locales/en/common.json";

import ptAuth from "./locales/pt/auth.json";
import ptFeed from "./locales/pt/feed.json";
import ptProfile from "./locales/pt/profile.json";
import ptCommon from "./locales/pt/common.json";

import esAuth from "./locales/es/auth.json";
import esFeed from "./locales/es/feed.json";
import esProfile from "./locales/es/profile.json";
import esCommon from "./locales/es/common.json";

const resources = {
    en: {
        auth: enAuth,
        feed: enFeed,
        profile: enProfile,
        common: enCommon,
    },
    pt: {
        auth: ptAuth,
        feed: ptFeed,
        profile: ptProfile,
        common: ptCommon,
    },
    es: {
        auth: esAuth,
        feed: esFeed,
        profile: esProfile,
        common: esCommon,
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        ns: ["common", "profile", "auth", "feed"],
        defaultNS: "common",
        fallbackLng: "en",
        lng: localStorage.getItem("lang") || "pt",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;