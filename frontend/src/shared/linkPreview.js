

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


export function parseTextWithLinks(text) {
	if (!text || typeof text !== "string") return [{ type: "text", content: "" }];
	const regex = /(https?:\/\/[^\s]+)/g;
	const parts = [];
	let lastIndex = 0;
	let match;
	while ((match = regex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
		}
		let url = match[1].replace(/[.,;:!?)]+$/, "");
		try {
			new URL(url);
			parts.push({ type: "link", content: match[1], url });
		} catch {
			parts.push({ type: "text", content: match[1] });
		}
		lastIndex = regex.lastIndex;
	}
	if (lastIndex < text.length) {
		parts.push({ type: "text", content: text.slice(lastIndex) });
	}
	return parts.length ? parts : [{ type: "text", content: text }];
}
