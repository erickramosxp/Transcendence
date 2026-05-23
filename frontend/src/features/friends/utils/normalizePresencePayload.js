/**
 * Normaliza payload de PRESENCE_UPDATED do WebSocket para o store.
 * @param {unknown} raw
 * @returns {{ userId: number, name: string | null, username: string | null, avatarUrl: string | null, online: boolean, lastSeenAt: string | null } | null}
 */
export function normalizePresencePayload(raw) {
	if (!raw || typeof raw !== 'object') return null

	const data = raw.payload && typeof raw.payload === 'object' ? raw.payload : raw
	const userId = Number(data.userId ?? data.user_id ?? data.id)

	if (!Number.isFinite(userId) || userId <= 0) return null

	return {
		userId,
		name: data.name ?? null,
		username: data.username ?? null,
		avatarUrl: data.avatarUrl ?? data.avatar_url ?? null,
		online: parseOnlineFlag(data.online ?? data.isOnline ?? data.is_online),
		lastSeenAt: data.lastSeenAt ?? data.last_seen_at ?? null,
	}
}

/** @param {unknown} value */
function parseOnlineFlag(value) {
	if (value === true || value === 1) return true
	if (value === false || value === 0) return false
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase()
		if (normalized === 'true' || normalized === '1') return true
		if (normalized === 'false' || normalized === '0') return false
	}
	return false
}
