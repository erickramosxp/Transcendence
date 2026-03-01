import { useState, useEffect } from "react";
import { extractUrl } from "../../utils/linkPreview";
import linkPreviewService from "../../../shared/api/linkPreviewService";
import { useDebounce } from "../../../hooks/useDebounce";

const LINK_PREVIEW_DEBOUNCE_MS = 600;

export function useCreatePost(onAddPost, onClose, postType) {
	const [text, setText] = useState("");
	const [file, setFile] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [linkPreview, setLinkPreview] = useState(null);
	const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
	const [linkPreviewError, setLinkPreviewError] = useState(null);

	const debouncedText = useDebounce(text, LINK_PREVIEW_DEBOUNCE_MS);

	useEffect(() => {
		const url = extractUrl(debouncedText);
		if (url) {
			setLinkPreviewLoading(true);
			setLinkPreviewError(null);
			linkPreviewService
				.fetchLinkPreview(url)
				.then((data) => {
					setLinkPreview(data);
					setLinkPreviewLoading(false);
					if (!data) {
						setLinkPreviewError("Preview indisponível para este link");
					}
				})
				.catch((error) => {
					setLinkPreviewError(error.message);
					setLinkPreviewLoading(false);
				});
		} else {
			setLinkPreview(null);
			setLinkPreviewLoading(false);
			setLinkPreviewError(null);
		}
	}, [debouncedText]);

	function handleSubmit() {
		if ( postType === "text" && text.trim() === "") return;

		if ((postType === "photo" || postType === "video") && file == null) return;

		onAddPost({
			text: text,
			file: file,
			fileType: typeof postType === "string" ? postType : postType?.type || "",
			linkPreview: linkPreview,
		});
		setText("");
		setFile(null);
		setLinkPreview(null);
		setLinkPreviewLoading(false);
		setLinkPreviewError(null);
		onClose();
	}

	function handleChange(e) {
		const value = e.target.value;
		setText(value);

		const match = value.match(/:(\w*)$/);
		if (match) {
			setShowEmojiPicker(true);
		} else {
			setShowEmojiPicker(false);
		}
	}

	function handleEmojiSelect(emojiData) {
		setText((prev) => prev.replace(/:(\w*)$/, "") + emojiData.emoji);
	}

	return {
		text,
		setText,
		linkPreview,
		linkPreviewLoading,
		linkPreviewError,
		file,
		setFile,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect,
	};
}
