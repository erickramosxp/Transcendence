import { useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { Input } from "@/design-system/primitives/Input";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage }) {
	const [text, setText] = useState("");
	function handleSendMessage(e) {
		e.preventDefault();
		if (!text.trim()) return;
		onSendMessage(text);
		setText("");
	}

	return (
		<form
			onSubmit={handleSendMessage}
			style={{
				display: "flex",
				alignItems: "center",
				marginBottom: 16,
				paddingTop: 8
			}}
		>
			<Input
				value={text}
				onChange={(e) => setText(e.target.value)}
				style={{ flex: 1, marginRight: 8 }}
			/>
			<Button
				onClick={handleSendMessage}
				size="sm"
				type="submit"
			>
				<Send className="h-4 w-4" />
			</Button>
		</form>
	)
}
