import { getListFriends } from "@/features/friends/service/friendService";
import { normalizeUsername } from "@/features/chat/utils/ConversationModalUtils";

const PAGE_SIZE = 60;


export async function resolveFriendForChat(rawUsername) {
	const normalized = normalizeUsername(rawUsername);
	if (!normalized) return null;

	const { data } = await getListFriends(0, PAGE_SIZE, normalized);
	const items = Array.isArray(data?.items) ? data.items : [];
	const lower = normalized.toLowerCase();
	return items.find((f) => String(f.username ?? "").toLowerCase() === lower) ?? null;
}
