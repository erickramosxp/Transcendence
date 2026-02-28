

export function extractUrl(text) {
	if (!text || typeof text !== "string") return null;
	const regex = /https?:\/\/[^\s]+/;
	const match = text.match(regex);
	if (!match) return null;
	let url = match[0];
	url = url.replace(/[.,;:!?)]+$/, "");
	try {
		new URL(url);
		return url;
	} catch {
		return null;
	}
}

