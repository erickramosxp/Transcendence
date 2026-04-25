// quem está online
// last seen
// status (online, away, offline)

// PRESENCE_UPDATED

// onlineUsers: {
//   12: true,
//   45: false
// }

import { create } from 'zustand'

export const usePresenceStore = create((set, get) => ({
	usersPresence: {},

	setPresenceList: (users) =>
		set({
			usersPresence: users.reduce((acc, user) => {
				acc[user.userId] = user
				return acc
			}, {})
		}),

	updatePresence: (user) =>
		set((state) => ({
			usersPresence: {
				...state.usersPresence,
				[user.userId]: {
					...state.usersPresence[user.userId],
					...user
				}
			}
		})),

	isUserOnline: (userId) => {
		return !!get().usersPresence[userId]?.online
	},

	getUserPresence: (userId) => {
		return get().usersPresence[userId]
	},

	resetPresenceStore: () =>
		set({
			usersPresence: {}
		})
}))