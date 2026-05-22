import { describe, expect, it } from 'vitest';
import { isReservedUsername } from '../reservedUsernames';

describe('isReservedUsername', () => {
  it('bloqueia rotas reservadas do app', () => {
    expect(isReservedUsername('feed')).toBe(true);
    expect(isReservedUsername('CHAT')).toBe(true);
    expect(isReservedUsername('search')).toBe(true);
    expect(isReservedUsername('editProfile')).toBe(true);
    expect(isReservedUsername('404')).toBe(true);
  });

  it('permite usernames comuns', () => {
    expect(isReservedUsername('maria')).toBe(false);
    expect(isReservedUsername('lll')).toBe(false);
  });
});
