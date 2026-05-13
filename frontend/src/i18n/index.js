import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enFeed from "./locales/en/feed.json";
import enProfile from "./locales/en/profile.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enAuthProvider from "./locales/en/authProvider.json";
import enChat from "./locales/en/chat.json";
import enSettings from "./locales/en/settings.json";
import enFriends from "./locales/en/friends.json";
import enPrivacyPolicy from "./locales/en/legalPrivacy.json";
import enTermsOfService from "./locales/en/termsOfService.json";
import enNotFound from "./locales/en/notFound.json";
import enLegalNavigation from "./locales/en/legalNavigation.json";

import ptAuth from "./locales/pt/auth.json";
import ptFeed from "./locales/pt/feed.json";
import ptProfile from "./locales/pt/profile.json";
import ptCommon from "./locales/pt/common.json";
import ptHome from "./locales/pt/home.json";
import ptAuthProvider from "./locales/pt/authProvider.json";
import ptChat from "./locales/pt/chat.json";
import ptSettings from "./locales/pt/settings.json";
import ptFriends from "./locales/pt/friends.json";
import ptPrivacyPolicy from "./locales/pt/legalPrivacy.json";
import ptTermsOfService from "./locales/pt/termsOfService.json";
import ptNotFound from "./locales/pt/notFound.json";
import ptLegalNavigation from "./locales/pt/legalNavigation.json";

import esAuth from "./locales/es/auth.json";
import esFeed from "./locales/es/feed.json";
import esProfile from "./locales/es/profile.json";
import esCommon from "./locales/es/common.json";
import esHome from "./locales/es/home.json";
import esAuthProvider from "./locales/es/authProvider.json";
import esChat from "./locales/es/chat.json";
import esSettings from "./locales/es/settings.json";
import esFriends from "./locales/es/friends.json";
import esPrivacyPolicy from "./locales/es/legalPrivacy.json";
import esTermsOfService from "./locales/es/termsOfService.json";
import esNotFound from "./locales/es/notFound.json";
import esLegalNavigation from "./locales/es/legalNavigation.json";

const resources = {
    "en-US": {
        auth: enAuth,
        feed: enFeed,
        profile: enProfile,
        common: enCommon,
        home: enHome,
        authProvider: enAuthProvider,
        chat: enChat,
        settings: enSettings,
        friends: enFriends,
        privacyPolicy: enPrivacyPolicy,
        termsOfService: enTermsOfService,
        notFound: enNotFound,
        legalNavigation: enLegalNavigation
    },
    "pt-BR": {
        auth: ptAuth,
        feed: ptFeed,
        profile: ptProfile,
        common: ptCommon,
        home: ptHome,
        authProvider: ptAuthProvider,
        chat: ptChat,
        settings: ptSettings,
        friends: ptFriends,
        privacyPolicy: ptPrivacyPolicy,
        termsOfService: ptTermsOfService,
        notFound: ptNotFound,
        legalNavigation: ptLegalNavigation
    },
    "es-ES": {
        auth: esAuth,
        feed: esFeed,
        profile: esProfile,
        common: esCommon,
        home: esHome,
        authProvider: esAuthProvider,
        chat: esChat,
        settings: esSettings,
        friends: esFriends,
        privacyPolicy: esPrivacyPolicy,
        termsOfService: esTermsOfService,
        notFound: esNotFound,
        legalNavigation: esLegalNavigation
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        ns: ["common", "profile", "auth", "feed", "home", "authProvider", "chat", "privacyPolicy", "termsOfService", "notFound", "legalNavigation"],
        defaultNS: "common",
        fallbackLng: "pt-BR",
        lng: localStorage.getItem("lang") || "pt-BR",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
