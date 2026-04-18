import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Paperclip, Send, Smile, X, Image as ImageIcon, File as FileIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function ChatAttachmentOptions({ onImagePick, onFilePick, onClose }) {
	const popoverRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (popoverRef.current && !popoverRef.current.contains(event.target)) {
				onClose();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	return (
		<div className="ds-chat-input-media-preview">
			<div
				ref={popoverRef}
				className="bg-popover border rounded-xl p-4 mb-3 flex flex-col w-72 shadow-xl z-50 relative"
				onClick={e => e.stopPropagation()}
			>
				<div className="font-semibold pb-2 text-center">Enviar...</div>
				<Button
					variant="ghost"
					size="lg"
					className="justify-start text-left w-full gap-2 my-1"
					onClick={onImagePick}
				>
					<ImageIcon className="text-cyan-500" /> Foto/Galeria
				</Button>
				<Button
					variant="ghost"
					size="lg"
					className="justify-start text-left w-full gap-2 my-1"
					onClick={onFilePick}
				>
					<FileIcon className="text-fuchsia-500" /> Documento/Arquivo
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2"
					onClick={onClose}
				>
					<X className="size-4" />
				</Button>
			</div>
		</div>
	);
}

export default function MessageInput({ onSendMessage }) {
	const { t } = useTranslation("chat");
	const [text, setText] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showAttachOptions, setShowAttachOptions] = useState(false);
	const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
	const [mediaFile, setMediaFile] = useState(null);
	const [fileInfo, setFileInfo] = useState(null);

	const imageInputRef = useRef(null);
	const fileInputRef = useRef(null);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const closePickerIfNarrow = () => {
			if (!mq.matches) setShowEmojiPicker(false);
		};
		closePickerIfNarrow();
		mq.addEventListener("change", closePickerIfNarrow);
		return () => mq.removeEventListener("change", closePickerIfNarrow);
	}, []);

	function handleSendMessage(e) {
		e.preventDefault();
		if (!text.trim() && !mediaFile) return;
		const payload = { text };
		if (mediaFile && (mediaPreviewUrl || fileInfo)) {
			payload.mediaUrl = mediaPreviewUrl;
			payload.fileInfo = fileInfo;
		}
		onSendMessage(payload);
		setText("");
		setMediaPreviewUrl(null);
		setMediaFile(null);
		setFileInfo(null);
	}

	function handleOpenAttachOptions() {
		setShowAttachOptions(true);
	}

	function handlePickImage() {
		setShowAttachOptions(false);
		imageInputRef.current?.click();
	}

	function handlePickFile() {
		setShowAttachOptions(false);
		fileInputRef.current?.click();
	}

	function handleImageInput(e) {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setMediaFile(file);
			setMediaPreviewUrl(url);
			setFileInfo({ name: file.name, size: file.size, type: file.type });
		}
		e.target.value = "";
	}

	function handleFileInput(e) {
		const file = e.target.files?.[0];
		if (file) {
			const isImg = file.type?.startsWith("image/");
			setMediaFile(file);
			setMediaPreviewUrl(isImg ? URL.createObjectURL(file) : null);
			setFileInfo({ name: file.name, size: file.size, type: file.type });
		}
		e.target.value = "";
	}

	function handleRemoveMedia() {
		setMediaPreviewUrl(null);
		setMediaFile(null);
		setFileInfo(null);
	}

	function handleEmojiSelect(emojiData) {
		setText((prev) => prev + emojiData.emoji);
	}

	return (
		<div className="w-full">
			{/* Preview acima do input */}
			{mediaFile && (
				<div className="ds-chat-input-media-preview flex items-center gap-3 mb-2 p-2 bg-muted/40 rounded-md border border-accent relative max-w-full">
					{mediaPreviewUrl ? (
						<img
							src={mediaPreviewUrl}
							alt="Media Preview"
							className="rounded-md max-h-28 max-w-56 border"
						/>
					) : (
						<div className="flex items-center gap-2 p-2 bg-accent/20 rounded border text-xs">
							<FileIcon className="inline-block text-accent" />
							<span title={fileInfo?.name} style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: 'inline-block' }}>
								{fileInfo?.name}
							</span>
						</div>
					)}
					<Button
						variant="ghost"
						size="icon"
						type="button"
						className="ds-chat-input-icon-btn absolute top-2 right-2"
						onClick={handleRemoveMedia}
					>
						<X className="ds-chat-icon-input" />
					</Button>
				</div>
			)}
			<form
				onSubmit={handleSendMessage}
				className="ds-chat-input-form flex items-center gap-2 relative"
			>
				<input
					type="file"
					accept="image/*"
					className="hidden"
					ref={imageInputRef}
					onChange={handleImageInput}
					tabIndex={-1}
				/>
				<input
					type="file"
					accept="*"
					className="hidden"
					ref={fileInputRef}
					onChange={handleFileInput}
					tabIndex={-1}
				/>
				<Button
					variant="outline"
					size="icon"
					type="button"
					className="ds-chat-input-icon-btn h-10 w-10 min-w-0 flex-shrink-0 flex-grow-0"
					onClick={handleOpenAttachOptions}
					style={{marginBottom: 0}}
				>
					<Paperclip className="ds-chat-icon-input" />
				</Button>
				{showAttachOptions && (
					<ChatAttachmentOptions
						onImagePick={handlePickImage}
						onFilePick={handlePickFile}
						onClose={() => setShowAttachOptions(false)}
					/>
				)}

				<div className="relative min-w-0 flex-1">
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onFocus={() => setShowEmojiPicker(false)}
						className="ds-chat-input-field h-10 pr-11"
						placeholder={t("input.placeholder")}
						style={{ minHeight: 40, marginBottom: 0, boxSizing: "border-box" }}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="ds-chat-input-emoji-btn h-7 w-7 top-1/2 right-2 -translate-y-1/2"
						tabIndex={-1}
						onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						style={{marginBottom: 0, position: "absolute"}}
					>
						<Smile className="size-4" />
					</Button>
					{showEmojiPicker && (
						<div className="ds-chat-input-emoji-pop">
							<EmojiPicker onEmojiClick={handleEmojiSelect} />
						</div>
					)}
				</div>
				<Button
					onClick={handleSendMessage}
					size="icon"
					type="submit"
					className="ds-chat-input-icon-btn h-10 w-10 min-w-0 flex-shrink-0 flex-grow-0"
					disabled={!text.trim() && !mediaFile}
					style={{marginBottom: 0}}
				>
					<Send className="ds-chat-icon-input" />
				</Button>
			</form>
		</div>
	);
}
