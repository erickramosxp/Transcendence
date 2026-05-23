import { describe, expect, it } from 'vitest'
import { normalizePresencePayload } from '../normalizePresencePayload'

describe('normalizePresencePayload', () => {
	it('parses online boolean and coerces userId', () => {
		const result = normalizePresencePayload({
			userId: '12',
			name: 'Maria',
			username: 'maria',
			online: true,
		})

		expect(result).toEqual({
			userId: 12,
			name: 'Maria',
			username: 'maria',
			avatarUrl: null,
			online: true,
			lastSeenAt: null,
		})
	})

	it('treats offline and string flags correctly', () => {
		expect(
			normalizePresencePayload({ userId: 3, online: false })?.online,
		).toBe(false)
		expect(
			normalizePresencePayload({ userId: 3, online: 'false' })?.online,
		).toBe(false)
		expect(
			normalizePresencePayload({ userId: 3, online: 'true' })?.online,
		).toBe(true)
	})

	it('defaults unknown online values to offline', () => {
		expect(
			normalizePresencePayload({ userId: 3, online: 'maybe' })?.online,
		).toBe(false)
	})
})
