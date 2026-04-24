import { useState, useEffect } from "react";
import { extractUrl } from "@/shared/linkPreview";
import linkPreviewService from "@/shared/api/linkPreviewService";
import { useDebounce } from "@/hooks/useDebounce";

const DEBOUNCE_MS = 600;
const MAX_CACHE = 80;
const previewByUrl = new Map();

function rememberPreview(url, data) {
	if (!data) return;
	if (previewByUrl.size >= MAX_CACHE) {
		const first = previewByUrl.keys().next().value;
		previewByUrl.delete(first);
	}
	previewByUrl.set(url, data);
}


export function useMessageLinkPreview(text) {
	const debouncedText = useDebounce(text ?? "", DEBOUNCE_MS);
	const [preview, setPreview] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const url = extractUrl(debouncedText);
		let cancelled = false;

		if (!url) {
			setPreview(null);
			setLoading(false);
			return;
		}

		const cached = previewByUrl.get(url);
		if (cached) {
			setPreview(cached);
			setLoading(false);
			return;
		}

		setLoading(true);
		setPreview(null);

		linkPreviewService
			.fetchLinkPreview(url)
			.then((data) => {
				if (cancelled) return;
				if (data) rememberPreview(url, data);
				setPreview(data);
				setLoading(false);
			})
			.catch(() => {
				if (cancelled) return;
				setPreview(null);
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [debouncedText]);

	return { preview, loading };
}
