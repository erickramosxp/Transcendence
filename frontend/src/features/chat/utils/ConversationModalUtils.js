export function normalizeUsername(raw) {
	return String(raw ?? "")
		.trim()
		.replace(/^@+/, "");
}

export function axiosErrorMessage(err) {
	const d = err?.response?.data;
	if (typeof d === "string") return d;
	if (d?.message) return d.message;
	if (Array.isArray(d?.violations)) {
		const v = d.violations[0];
		if (v?.message) return v.message;
	}
	return null;
}

export function getFriendDisplayLabel(friend) {
	const username = friend?.username ?? "";
	const name = friend?.name?.trim();
	return name ? `${name} (@${username})` : `@${username}`;
}
