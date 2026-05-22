import api from "@/shared/api/httpClient";

export async function getHeadlines(limit = 5) {
	const { data } = await api.get("/editorial/headlines", {
		params: { limit },
	});
	return data;
}
