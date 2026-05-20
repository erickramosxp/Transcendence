import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { isReservedUsername } from '@/shared/routing/reservedUsernames';

export const APP_NAME = 'Videa';

/** Rotas com título dinâmico definido por `useDocumentTitle` no componente da página. */
const ROUTES_WITH_PAGE_OVERRIDE = new Set(['/notifications']);

const STATIC_ROUTE_TITLE_KEYS = {
  '/feed': 'feed',
  '/chat': 'messages',
  '/friends': 'friends',
  '/legal/privacy': 'privacy',
  '/legal/terms': 'terms',
  '/dev/theme-showcase': 'themeShowcase',
  '/404': 'notFound',
};

/**
 * Formato padrão: "Videa | Feed"
 * Com contador (ex.: notificações): "Videa | (3) Notificações"
 */
export function formatDocumentTitle(pageTitle, { unreadCount } = {}) {
  const label = pageTitle?.trim();
  if (!label) return APP_NAME;

  const count =
    typeof unreadCount === 'number' && unreadCount > 0
      ? unreadCount > 99
        ? '99+'
        : String(unreadCount)
      : null;

  const segment = count ? `(${count}) ${label}` : label;
  return `${APP_NAME} | ${segment}`;
}

export function isProfilePath(pathname) {
  if (pathname === '/profile' || pathname.startsWith('/profile/')) return true;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return false;

  return !isReservedUsername(segments[0]);
}

function usesPageTitleOverride(pathname) {
  return ROUTES_WITH_PAGE_OVERRIDE.has(pathname) || isProfilePath(pathname);
}

/**
 * Resolve a chave i18n (`common.pageTitle.*`) para a rota atual.
 * Retorna `null` quando a página define o título via `useDocumentTitle`.
 */
export function resolveRouteTitleKey(pathname, { isAuthenticated } = {}) {
  if (usesPageTitleOverride(pathname)) {
    return null;
  }

  if (pathname === '/' || pathname === '') {
    return isAuthenticated ? 'feed' : 'home';
  }

  const staticKey = STATIC_ROUTE_TITLE_KEYS[pathname];
  if (staticKey) return staticKey;

  return 'notFound';
}

let syncRouteTitle = null;

/**
 * Define o título com base na rota (mapeamento central em App).
 * Páginas com contexto dinâmico usam `useDocumentTitle` por cima.
 */
export function RouteDocumentTitle() {
  const location = useLocation();
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const loading = auth?.loading ?? false;
  const { t, i18n } = useTranslation('common');

  const applyRouteTitle = useCallback(() => {
    const key = resolveRouteTitleKey(location.pathname, { isAuthenticated });

    if (key === null) {
      document.title = APP_NAME;
      return;
    }

    document.title = formatDocumentTitle(t(`pageTitle.${key}`));
  }, [location.pathname, isAuthenticated, t]);

  useEffect(() => {
    if (loading) return undefined;

    syncRouteTitle = applyRouteTitle;
    applyRouteTitle();

    return () => {
      syncRouteTitle = null;
    };
  }, [applyRouteTitle, loading]);

  useEffect(() => {
    const onLanguageChanged = () => applyRouteTitle();
    i18n.on('languageChanged', onLanguageChanged);
    return () => i18n.off('languageChanged', onLanguageChanged);
  }, [applyRouteTitle, i18n]);

  return null;
}

/**
 * Título dinâmico por página (perfil, notificações com contador, etc.).
 */
export function useDocumentTitle(pageTitle, options = {}) {
  const { enabled = true, unreadCount } = options;
  const location = useLocation();

  useEffect(() => {
    if (!enabled || !pageTitle) return undefined;

    document.title = formatDocumentTitle(pageTitle, { unreadCount });

    return () => {
      if (syncRouteTitle) syncRouteTitle();
      else document.title = APP_NAME;
    };
  }, [pageTitle, enabled, unreadCount, location.pathname]);
}
