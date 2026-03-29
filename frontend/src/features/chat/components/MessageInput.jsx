import { useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { Input } from "@/design-system/primitives/Input";
import { Paperclip, Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ onSendMessage }) {
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
			style={{
				display: "flex",
				alignItems: "center",
				margin: 0,
				padding: "8px 12px",
				gap: 10,
				borderRadius: 12,
				position: "relative", // Adiciona contexto para elementos absolutos filhos
			}}
		>
			<Button variant="outline" size="icon" style={{ flex: "0 0 auto", height: 40, width: 40, minWidth: 40, minHeight: 40, padding: 0 }}>
				<Paperclip className="h-5 w-5" />
			</Button>

			<div style={{ position: "relative", flex: 1 }}>
				<Input
					value={text}
					onChange={(e) => setText(e.target.value)}
					onFocus={() => setShowEmojiPicker(false)}
					style={{
						width: "100%",
						height: 40,
						borderRadius: 8,
						paddingLeft: 14,
						paddingRight: 32, // dá espaço pro ícone SMILE
					}}
					placeholder="Digite sua mensagem..."
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					style={{
						position: "absolute",
						right: "8px",
						top: "50%",
						transform: "translateY(-50%)",
						padding: 0,
						height: 28,
						width: 28,
						minWidth: 28,
						minHeight: 28,
						color: "#888",
						zIndex: 2,
					}}
					tabIndex={-1}
					aria-label="Abrir emojis"
					onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}
				>
					<Smile className="size-4" />
				</Button>
				{showEmojiPicker && (
					<div
						className="absolute"
						style={{
							bottom: "calc(100% + 8px)",
							right: 0,
							zIndex: 10,
						}}
					>
						<EmojiPicker onEmojiClick={handleEmojiSelect} />
					</div>
				)}
			</div>

			<Button
				onClick={handleSendMessage}
				size="icon"
				type="submit"
				style={{ flex: "0 0 auto", height: 40, width: 40, minWidth: 40, minHeight: 40, padding: 0 }}
			>
				<Send className="h-5 w-5" />
			</Button>
		</form>
	)
}
