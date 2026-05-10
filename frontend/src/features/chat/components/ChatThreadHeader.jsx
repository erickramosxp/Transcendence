import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Users } from "lucide-react";
import { AvatarWithStatus, Button } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";
import { usePresenceStore } from "@/features/friends/store/usePresenceStore";
import GroupParticipantsModal from "@/features/chat/components/modals/GroupParticipantsModal";

export default function ChatThreadHeader({
	currentChat,
	onBack,
	realtimeOk = true,
}) {
	const { t } = useTranslation("chat");
	const [participantsOpen, setParticipantsOpen] = useState(false);

	const isGroup = currentChat.type === "group";
	const peer = currentChat.user;
	const peerId = peer?.id;
	const peerOnline = usePresenceStore((s) => {
		if (isGroup || peerId == null) return false;
		return !!s.usersPresence[peerId]?.online;
	});
	const status =
		!realtimeOk ? "offline" : peerOnline ? "online" : "offline";
	const groupTitle = (
		currentChat.chatName ??
		currentChat.name ??
		""
	).trim();
	const directTitle =
		(peer?.name ?? "").trim() ||
		(peer?.username ?? "").trim() ||
		(currentChat.name ?? "").trim();
	const headerTitle = isGroup
		? groupTitle || t("list.fallbackGroup")
		: directTitle || t("list.fallbackDm");

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
				src={currentChat.user?.avatarUrl}
				name={headerTitle}
				status={status}
				showStatus={!isGroup}
				size="lg"
			/>
			<div className="min-w-0 flex-1 space-y-1">
				<h3 className="ds-chat-thread-title">{headerTitle}</h3>
				{!isGroup && (
					<span
						className={cn(
							"ds-chat-thread-status",
							realtimeOk && peerOnline
								? "ds-chat-thread-status--online"
								: "ds-chat-thread-status--offline",
						)}
					>
						{!realtimeOk
							? t("status.offline")
							: peerOnline
								? t("status.online")
								: t("status.offline")}
					</span>
				)}
			</div>
			{isGroup && currentChat?.id != null && (
				<>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0"
						onClick={() => setParticipantsOpen(true)}
						aria-label={t("participants.openAria")}
					>
						<Users className="size-5" aria-hidden />
					</Button>
					<GroupParticipantsModal
						open={participantsOpen}
						onClose={() => setParticipantsOpen(false)}
						chatId={currentChat.id}
					/>
				</>
			)}
		</div>
	);
}
