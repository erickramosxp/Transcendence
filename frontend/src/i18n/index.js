import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enFeed from "./locales/en/feed.json";
import enProfile from "./locales/en/profile.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enAuthProvider from "./locales/en/authProvider.json";
import enSettings from "./locales/en/settings.json";
import enFriends from "./locales/en/friends.json";

import ptAuth from "./locales/pt/auth.json";
import ptFeed from "./locales/pt/feed.json";
import ptProfile from "./locales/pt/profile.json";
import ptCommon from "./locales/pt/common.json";
import ptHome from "./locales/pt/home.json";
import ptAuthProvider from "./locales/pt/authProvider.json";
import ptSettings from "./locales/pt/settings.json";
import ptFriends from "./locales/pt/friends.json";

import esAuth from "./locales/es/auth.json";
import esFeed from "./locales/es/feed.json";
import esProfile from "./locales/es/profile.json";
import esCommon from "./locales/es/common.json";
import esHome from "./locales/es/home.json";
import esAuthProvider from "./locales/es/authProvider.json";
import esSettings from "./locales/es/settings.json";
import esFriends from "./locales/es/friends.json";

const resources = {
    "en-US": {
        auth: enAuth,
        feed: enFeed,
        profile: enProfile,
        common: enCommon,
        home: enHome,
        authProvider: enAuthProvider,
        settings: enSettings,
        friends: enFriends
    },
    "pt-BR": {
        auth: ptAuth,
        feed: ptFeed,
        profile: ptProfile,
        common: ptCommon,
        home: ptHome,
        authProvider: ptAuthProvider,
        settings: ptSettings,
        friends: ptFriends
    },
    "es-ES": {
        auth: esAuth,
        feed: esFeed,
        profile: esProfile,
        common: esCommon,
        home: esHome,
        authProvider: esAuthProvider,
        settings: esSettings,
        friends: esFriends
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        ns: ["common", "profile", "auth", "feed", "home", "authProvider"],
        defaultNS: "common",
        fallbackLng: "pt-BR",
        lng: localStorage.getItem("lang") || "pt-BR",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;