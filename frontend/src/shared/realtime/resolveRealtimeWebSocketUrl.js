/**
 * URL do WebSocket de realtime. O construtor nativo exige esquema ws/wss (não http/https).
 * Espelha a lógica de base do httpClient para dev/prod.
 */
export function resolveRealtimeWebSocketUrl(token) {
	const encoded = encodeURIComponent(token);
	const raw = import.meta.env.VITE_BACKEND_URL;
	const hasExplicit = raw !== undefined && raw !== "";

	let httpBase;
	if (hasExplicit) {
		if (
			import.meta.env.PROD &&
			(String(raw).includes("localhost:8080") ||
				String(raw).includes("127.0.0.1:8080"))
		) {
			httpBase = null;
		} else {
			httpBase = String(raw).trim();
		}
	} else {
		httpBase = import.meta.env.PROD ? null : "http://localhost:8080";
	}


	if (
		typeof window !== "undefined" &&
		window.location.protocol === "https:" &&
		import.meta.env.DEV &&
		httpBase
	) {
		try {
			const u = new URL(httpBase);
			const local =
				u.hostname === "localhost" || u.hostname === "127.0.0.1";
			if (local && u.protocol === "http:") {
				httpBase = null;
			}
		} catch {
			httpBase = null;
		}
	}

	if (!httpBase) {
		const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
		return `${proto}//${window.location.host}/ws/realtime?token=${encoded}`;
	}

	try {
		const u = new URL(httpBase);
		const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
		return `${wsProto}//${u.host}/ws/realtime?token=${encoded}`;
	} catch {
		const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
		return `${proto}//${window.location.host}/ws/realtime?token=${encoded}`;
	}
}
