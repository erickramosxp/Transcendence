

export function getCurrentTime(date_time, locale = 'pt-BR') {

	const now = Date.now();
	const created = new Date(date_time).getTime();
	const diff = now - created;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	// const language = locale == 'pt' ? 'pt-BR' : locale == 'en' ? 'en-US' : 'es';

	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

	if (days > 0) return rtf.format(-days, 'day');
	if (hours > 0) return rtf.format(-hours, 'hour');
	if (minutes > 0) return rtf.format(-minutes, 'minute');
	return rtf.format(-seconds, 'second');
}