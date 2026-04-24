import { useEffect, useState } from "react";

import { getListFriends } from "@/features/friends/service/friendService";
import { normalizeUsername } from "@/features/chat/utils/ConversationModalUtils";

const DEBOUNCE_MS = 250;

/**
 * @param {string} query
 * @param {{ pageSize?: number, excludeFriendIds?: Set<string> | null }} [options]
 */
export function useDebouncedFriendSuggestions(query, options = {}) {
	const { pageSize = 8, excludeFriendIds = null } = options;
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		let cancelled = false;
		const normalized = normalizeUsername(query);

		if (!normalized) {
			setSuggestions([]);
			return undefined;
		}

		const timeoutId = setTimeout(async () => {
			try {
				const response = await getListFriends(0, pageSize, normalized);
				if (cancelled) return;
				let items = Array.isArray(response?.data?.items) ? response.data.items : [];
				if (excludeFriendIds?.size) {
					items = items.filter((f) => !excludeFriendIds.has(String(f.friendId)));
				}
				setSuggestions(items);
			} catch {
				if (!cancelled) setSuggestions([]);
			}
		}, DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, [query, pageSize, excludeFriendIds]);

	return [suggestions, setSuggestions];
}
