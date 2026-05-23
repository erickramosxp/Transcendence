export const PROFILE_AUTHOR_NAME_UPDATED = 'transcendence:profile-author-name-updated';


export function dispatchProfileAuthorNameUpdated({ username, name }) {
	const normalizedUsername = String(username ?? '').trim();
	const normalizedName = String(name ?? '').trim();
	if (!normalizedUsername || !normalizedName) return;

	window.dispatchEvent(
		new CustomEvent(PROFILE_AUTHOR_NAME_UPDATED, {
			detail: { username: normalizedUsername, name: normalizedName },
		}),
	);
}


export function mapItemsWithAuthorName(items, username, name) {
	if (!Array.isArray(items) || !username) return items;

	const needsUpdate = items.some(
		(item) => item?.username === username && item?.name !== name,
	);
	if (!needsUpdate) return items;

	return items.map((item) =>
		item?.username === username ? { ...item, name } : item,
	);
}
