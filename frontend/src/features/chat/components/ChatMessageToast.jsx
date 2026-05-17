import { Avatar } from "@/design-system";
import { navigateToChat } from "@/shared/navigation/appNavigate";
import { useTranslation } from "react-i18next";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";

const PREVIEW_MAX = 72;

export function truncateChatToastPreview(text) {
	const trimmed = (text ?? "").trim();
	if (!trimmed) return "";
	if (trimmed.length <= PREVIEW_MAX) return trimmed;
	return `${trimmed.slice(0, PREVIEW_MAX - 1)}…`;
}

export function ChatMessageToast({
	chatId,
	senderName,
	preview,
	messageCount = 1,
	avatarUrl,
	username,
	closeToast,
}) {
	const { t } = useTranslation("chat");

	const body =
		messageCount > 1
			? t("toast.messageBodyMany", {
					preview: preview || t("toast.previewEmpty"),
					count: messageCount,
				})
			: preview || t("toast.previewEmpty");

	function openChat() {
		closeToast?.();
		navigateToChat(chatId);
	}

	return (
		<div
			role="status"
			className="flex w-[min(100vw-2rem,360px)] overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg"
		>
			<span className="w-1 shrink-0 bg-primary" aria-hidden />
			<div className="flex min-w-0 flex-1 items-stretch">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						openChat();
					}}
					className="flex min-w-0 flex-1 cursor-pointer gap-3 p-3 pr-2 text-left transition-colors hover:bg-accent/40"
					aria-label={t("toast.openChat")}
				>
					<Avatar
						className="shrink-0"
						size="md"
						src={avatarUrl}
						name={senderName}
						username={username}
					/>
					<div className="min-w-0 flex-1">
						<p className="flex items-start gap-2 text-sm leading-snug text-foreground">
							<MessageCircle
								className={cn(
									"mt-0.5 size-4 shrink-0 text-primary",
								)}
								aria-hidden
							/>
							<span>
								<span className="font-semibold">{senderName}</span>
								<span className="text-muted-foreground">
									{" "}
									{t("toast.messageTitle")}
								</span>
							</span>
						</p>
						<p className="mt-1 pl-6 text-xs text-muted-foreground line-clamp-2">
							{body}
						</p>
					</div>
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						closeToast?.();
					}}
					className="shrink-0 self-start rounded p-2.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
					aria-label={t("toast.close")}
				>
					<X className="size-4" aria-hidden />
				</button>
			</div>
		</div>
	);
}
