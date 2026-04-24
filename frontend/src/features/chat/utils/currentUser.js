const USERS_KEY = "@trascendence:user";

export function readCurrentUserId() {
	try {
		const raw = localStorage.getItem(USERS_KEY);
		if (!raw) return 1;
		const u = JSON.parse(raw);
		return u?.id ?? 1;
	} catch {
		return 1;
	}
}
