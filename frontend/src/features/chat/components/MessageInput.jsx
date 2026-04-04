import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Paperclip, Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ onSendMessage }) {
	const { t } = useTranslation("chat");
	const [text, setText] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
		<form
			onSubmit={handleSendMessage}
			className="relative m-0 flex items-center gap-2 rounded-xl py-1 sm:gap-2.5"
		>
			<Button
				variant="outline"
				size="icon"
				type="button"
				className="size-9 shrink-0 sm:size-10"
			>
				<Paperclip className="size-4 sm:size-5" />
			</Button>

			<div className="relative min-w-0 flex-1">
				<Input
					value={text}
					onChange={(e) => setText(e.target.value)}
					onFocus={() => setShowEmojiPicker(false)}
					className="h-9 rounded-lg pr-10 sm:h-10"
					placeholder={t("input.placeholder")}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-1 top-1/2 z-[2] size-7 min-h-7 min-w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					tabIndex={-1}
					onClick={() => {
						setShowEmojiPicker(!showEmojiPicker);
					}}
				>
					<Smile className="size-4" />
				</Button>
				{showEmojiPicker && (
					<div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-10">
						<EmojiPicker onEmojiClick={handleEmojiSelect} />
					</div>
				)}
			</div>

			<Button
				onClick={handleSendMessage}
				size="icon"
				type="submit"
				className="size-9 shrink-0 sm:size-10"
			>
				<Send className="size-4 sm:size-5" />
			</Button>
		</form>
	);
}
