/** Segmentos de URL reservados pelo app — não são usernames de perfil. */
export const RESERVED_USERNAMES = new Set([
  'feed',
  'search',
  'editprofile',
  'profile',
  'chat',
  'notifications',
  'friends',
  'legal',
  'dev',
  '404',
]);

export function isReservedUsername(username) {
  if (!username) return true;
  return RESERVED_USERNAMES.has(String(username).toLowerCase());
}
