export function resolveDateLocale(locale) {
	if (!locale) return "pt-BR";
	const l = String(locale).toLowerCase();
	if (l.startsWith("pt")) return "pt-BR";
	if (l.startsWith("en")) return "en-US";
	if (l.startsWith("es")) return "es-ES";
	return locale;
}

function startOfLocalDay(d) {
	const x = new Date(d);
	return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

export function formatChatBubbleTime(iso, locale) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return new Intl.DateTimeFormat(resolveDateLocale(locale), {
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
}

export function isSameChatDay(isoA, isoB) {
	const a = startOfLocalDay(new Date(isoA)).getTime();
	const b = startOfLocalDay(new Date(isoB)).getTime();
	return a === b;
}

export function formatChatDaySeparatorLabel(iso, locale, labels) {
	const d = startOfLocalDay(new Date(iso));
	const today = startOfLocalDay(new Date());
	const y = new Date(today);
	y.setDate(y.getDate() - 1);

	if (d.getTime() === today.getTime()) return labels.today;
	if (d.getTime() === y.getTime()) return labels.yesterday;

	const long = new Intl.DateTimeFormat(resolveDateLocale(locale), {
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(new Date(iso));
	return long.replace(/^./u, (c) => c.toUpperCase());
}
