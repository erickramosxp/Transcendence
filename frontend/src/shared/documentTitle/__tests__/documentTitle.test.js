import { describe, expect, it } from 'vitest';
import {
  APP_NAME,
  formatDocumentTitle,
  isProfilePath,
  resolveRouteTitleKey,
} from '../index.js';

describe('formatDocumentTitle', () => {
  it('retorna só a marca quando não há página', () => {
    expect(formatDocumentTitle('')).toBe(APP_NAME);
    expect(formatDocumentTitle(null)).toBe(APP_NAME);
  });

  it('formata como "Videa | Página"', () => {
    expect(formatDocumentTitle('Feed')).toBe('Videa | Feed');
  });

  it('inclui contador de não lidas no nome da página', () => {
    expect(formatDocumentTitle('Notificações', { unreadCount: 3 })).toBe(
      'Videa | (3) Notificações',
    );
    expect(formatDocumentTitle('Notificações', { unreadCount: 150 })).toBe(
      'Videa | (99+) Notificações',
    );
  });
});

describe('isProfilePath', () => {
  it('identifica rotas de perfil', () => {
    expect(isProfilePath('/profile')).toBe(true);
    expect(isProfilePath('/profile/joao')).toBe(true);
    expect(isProfilePath('/joao')).toBe(true);
  });

  it('ignora rotas reservadas do app', () => {
    expect(isProfilePath('/feed')).toBe(false);
    expect(isProfilePath('/notifications')).toBe(false);
    expect(isProfilePath('/search')).toBe(false);
    expect(isProfilePath('/editProfile')).toBe(false);
  });
});

describe('resolveRouteTitleKey', () => {
  it('mapeia rotas estáticas', () => {
    expect(resolveRouteTitleKey('/feed', { isAuthenticated: true })).toBe('feed');
    expect(resolveRouteTitleKey('/chat', { isAuthenticated: true })).toBe('messages');
  });

  it('usa home ou feed na raiz conforme autenticação', () => {
    expect(resolveRouteTitleKey('/', { isAuthenticated: false })).toBe('home');
    expect(resolveRouteTitleKey('/', { isAuthenticated: true })).toBe('feed');
  });

  it('delega perfil e notificações ao hook da página', () => {
    expect(resolveRouteTitleKey('/notifications', { isAuthenticated: true })).toBe(null);
    expect(resolveRouteTitleKey('/maria', { isAuthenticated: true })).toBe(null);
  });

  it('trata rotas removidas como não encontradas', () => {
    expect(resolveRouteTitleKey('/search', { isAuthenticated: true })).toBe('notFound');
    expect(resolveRouteTitleKey('/editProfile', { isAuthenticated: true })).toBe('notFound');
  });
});
