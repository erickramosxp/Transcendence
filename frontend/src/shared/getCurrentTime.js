

export function getCurrentTime(date_time) {

		const now = Date.now();
		const created = new Date(date_time).getTime();
		const diff = now - created;

		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0)
			return `há ${days} dia${days > 1 ? 's' : ''}`;
		if (hours > 0)
			return `há ${hours} hora${hours > 1 ? 's' : ''}`;
		if (minutes)
			return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
		return `há poucos segundos`;
}