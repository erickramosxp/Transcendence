import { useEffect } from "react";


export function useInfiniteScroll(sentinelRef, onLoadMore, options = {}) {
	const { enabled = true, rootMargin = "200px" } = options;

	useEffect(() => {
		if (!enabled || !sentinelRef?.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting) onLoadMore();
			},
			{ root: null, rootMargin, threshold: 0 }
		);

		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [sentinelRef, onLoadMore, enabled, rootMargin]);
}
