import { useTranslation } from "react-i18next";
import { useChatStore } from "@/features/chat/store/useChatStore";

export default function ChatTypingIndicator() {
	const typingUsers = useChatStore((s) => s.typingUsers);
	const { t } = useTranslation("chat");

	if (typingUsers.length === 0) return null;

	const names = typingUsers.map((u) => u.username);
	let text;
	if (names.length === 1) {
		text = t("thread.typingOne", { name: names[0] });
	} else if (names.length === 2) {
		text = t("thread.typingTwo", { a: names[0], b: names[1] });
	} else {
		text = t("thread.typingMany", { a: names[0], b: names[1] });
	}

	return (
		<p
			className="ds-chat-typing-indicator"
			aria-live="polite"
			role="status"
		>
			{text}
		</p>
	);
}
