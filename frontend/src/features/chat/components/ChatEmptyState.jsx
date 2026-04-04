import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

export default function ChatEmptyState() {
	const { t } = useTranslation("chat");

	return (
		<div className="ds-chat-window-surface ds-chat-empty-shell">
			<div className="ds-chat-empty-hero" aria-hidden>
				<MessageCircle className="size-8" strokeWidth={1.75} />
			</div>
			<h3 className="ds-chat-empty-heading">{t("empty.title")}</h3>
			<p className="ds-chat-empty-text">{t("empty.hint")}</p>
		</div>
	);
}
