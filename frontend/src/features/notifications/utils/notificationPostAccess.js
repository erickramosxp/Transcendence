import { getFeed } from "@/features/feed/feedService";

const FEED_PAGE_SIZE = 20;
const MAX_FEED_PAGES = 100;

export async function findAccessiblePostForNotification(postId) {
	const targetId = Number(postId);
	if (Number.isNaN(targetId)) return null;

	let page = 0;

	while (page < MAX_FEED_PAGES) {
		const response = await getFeed(page, FEED_PAGE_SIZE);
		const resp = response?.data ?? response;
		const items = Array.isArray(resp?.items) ? resp.items : [];

		const found = items.find(
			(post) => post?.id != null && Number(post.id) === targetId,
		);
		if (found) return found;

		if (!resp?.hasMore) break;
		page += 1;
	}

	return null;
}
