import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Paperclip, Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ onSendMessage }) {
	const { t } = useTranslation("chat");
	const [text, setText] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
		if (!text.trim()) return;
		onSendMessage(text);
		setText("");
	}

	function handleEmojiSelect(emojiData) {
		setText((prev) => prev + emojiData.emoji);
	}

	return (
		<form onSubmit={handleSendMessage} className="ds-chat-input-form">
			<Button
				variant="outline"
				size="icon"
				type="button"
				className="ds-chat-input-icon-btn"
			>
				<Paperclip className="ds-chat-icon-input" />
			</Button>

			<div className="relative min-w-0 flex-1">
				<Input
					value={text}
					onChange={(e) => setText(e.target.value)}
					onFocus={() => setShowEmojiPicker(false)}
					className="ds-chat-input-field"
					placeholder={t("input.placeholder")}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="ds-chat-input-emoji-btn"
					tabIndex={-1}
					onClick={() => {
						setShowEmojiPicker(!showEmojiPicker);
					}}
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
				className="ds-chat-input-icon-btn"
			>
				<Send className="ds-chat-icon-input" />
			</Button>
		</form>
	);
}
