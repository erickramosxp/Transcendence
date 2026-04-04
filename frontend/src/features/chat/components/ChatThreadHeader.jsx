import { useTranslation } from "react-i18next";
import { ChevronLeft, Phone, Video } from "lucide-react";
import { AvatarWithStatus, Button } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";

export default function ChatThreadHeader({ currentChat, onBack }) {
	const { t } = useTranslation("chat");
	const status = currentChat.status ?? "online";
	const online = status === "online";

	return (
		<div className="ds-chat-thread-header">
			{onBack && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="shrink-0 md:hidden"
					onClick={onBack}
					aria-label={t("a11y.back")}
				>
					<ChevronLeft className="size-5" />
				</Button>
			)}
			<AvatarWithStatus
				src={currentChat.avatar}
				name={currentChat.name}
				status={status}
				size="lg"
			/>
			<div className="min-w-0 flex-1 space-y-1">
				<h3 className="ds-chat-thread-title">{currentChat.name}</h3>
				<span
					className={cn(
						"ds-chat-thread-status",
						online
							? "ds-chat-thread-status--online"
							: "ds-chat-thread-status--offline",
					)}
				>
					{online ? t("status.online") : t("status.offline")}
				</span>
			</div>
			<div className="ds-chat-thread-actions">
				<Button variant="ghost" size="icon" aria-label={t("a11y.call")}>
					<Phone className="ds-chat-icon-header" />
				</Button>
				<Button variant="ghost" size="icon" aria-label={t("a11y.video")}>
					<Video className="ds-chat-icon-header" />
				</Button>
			</div>
		</div>
	);
}
