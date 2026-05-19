import React, { useState, useEffect } from "react";
import { extractUrl } from "@/shared/linkPreview";
import linkPreviewService from "@/shared/api/linkPreviewService";
import { useDebounce } from "@/hooks/useDebounce";
import { validImageFile, validVideoFile, validateImageContent } from "@/features/profile/utils/validFile";
import { LIMITS } from "@/shared/validation/limits";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getMyProfileAvatar } from "@/features/profile/services/profileService";

const LINK_PREVIEW_DEBOUNCE_MS = 600;

export function useCreatePost(onAddPost, onClose, postType) {
	const { t } = useTranslation();

	const [text, setText] = useState("");
	const [file, setFile] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [linkPreview, setLinkPreview] = useState(null);
	const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
	const [linkPreviewError, setLinkPreviewError] = useState(null);
	const [uploadPercent, setUploadPercent] = useState(null);
	const [avatarUrl, setAvatarUrl] = useState(null);

	const debouncedText = useDebounce(text, LINK_PREVIEW_DEBOUNCE_MS);

	useEffect(() => {
		const getMyAvatar = async () => {
			try {
				const resp = await getMyProfileAvatar();
				setAvatarUrl(resp.avatarUrl);
			} catch {
				// avatar opcional no composer
			}
		};

		getMyAvatar();
	}, []);

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

	const cleanAllInput = () => {
		setText("");
		setFile(null);
		setLinkPreview(null);
		setLinkPreviewLoading(false);
		setLinkPreviewError(null);
	};

	/**
	 * Envia o post com validação de texto (`LIMITS.postText`) e de arquivo:
	 * - Foto: `validImageFile` → `validateImageContent` → compressão (max 2 MB, 1024px; GIF não comprime).
	 * - Vídeo: `validVideoFile` (`LIMITS.postVideoFileMB`, apenas `video/mp4`).
	 * A seleção via `FileUploadButton` já valida MIME/tamanho; esta função revalida antes do upload.
	 */
	async function handleSubmit() {
		const trimmedText = text.trim();

		if (postType === "text" && trimmedText === "") {
			toast.error(t("common:errors.post.empty"));
			return;
		}

		if (text.length > LIMITS.postText) {
			toast.error(t("common:errors.post.tooLong", { max: LIMITS.postText }));
			return;
		}

		if ((postType === "photo" || postType === "video") && file == null) {
			const msg =
				postType === "photo"
					? t("common:errors.post.emptyImage")
					: t("common:errors.post.emptyVideo");
			toast.error(msg);
			return;
		}

		setUploadPercent(0);
		let fileToUpload = file;
		if (file) {
			let validation;
			if (postType === "photo") {
				validation = validImageFile(file, "image");
				if (validation.valid) {
					validation = await validateImageContent(file);

					if (validation.valid && file.type !== "image/gif") {
						const { default: imageCompression } = await import(
							"browser-image-compression"
						);

						const options = {
							maxSizeMB: 2,
							maxWidthOrHeight: 1024,
							useWebWorker: true,
						};

						fileToUpload = await imageCompression(file, options);
					}
				}
			} else if (postType === "video") {
				validation = validVideoFile(file);
			}

			if (!validation?.valid) {
				toast.error(validation.error);
				setFile(null);
				return;
			}
		}

		try {
			await onAddPost(
				{
					text,
					file: fileToUpload,
					fileType: typeof postType === "string" ? postType : postType?.type || "",
					linkPreview,
				},
				setUploadPercent,
			);

			setUploadPercent(100);

			cleanAllInput();
			setTimeout(() => {
				setUploadPercent(null);
				onClose();
			}, 300);
		} catch {
			// erro de rede tratado em Feed.jsx
		}
	}

	function handleChange(e) {
		const value = e.target.value;
		if (value.length > LIMITS.postText) return;
		setText(value);

		const match = value.match(/:(\w*)$/);
		setShowEmojiPicker(!!match);
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
		uploadPercent,
		avatarUrl,
		file,
		setFile,
		showEmojiPicker,
		handleSubmit,
		handleChange,
		handleEmojiSelect,
		maxTextLength: LIMITS.postText,
	};
}
