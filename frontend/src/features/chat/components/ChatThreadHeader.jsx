import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Phone } from "lucide-react";
import { AvatarWithStatus, Button } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";
import { VoiceCallModal } from "@/features/chat/components/VoiceCallModal";

export default function ChatThreadHeader({ currentChat, onBack }) {
	const { t } = useTranslation("chat");
	const status = currentChat.status ?? "online";
	const online = status === "online";
	// Fase `incoming` virá do sinal (WebSocket/WebRTC); por ora o ícone de telefone abre só `outgoing`.
	const [voiceCall, setVoiceCall] = useState({
		open: false,
		phase: "outgoing",
	});

	function openOutgoingCall() {
		setVoiceCall({ open: true, phase: "outgoing" });
	}

	/** Fecha o modal e restaura a fase para a próxima chamada (inclui recusar / cancelar / encerrar). */
	function endVoiceSession() {
		setVoiceCall({ open: false, phase: "outgoing" });
	}

	const isGroup = currentChat.type === "group";
	const groupTitle = (
		currentChat.chatName ??
		currentChat.chat_name ??
		currentChat.name ??
		""
	).trim();
	const directTitle = (currentChat.name ?? "").trim();
	const headerTitle = isGroup
		? groupTitle || t("peerFallback")
		: directTitle || t("list.directDm");

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
				// src={currentChat.user.avatarUrl}
				name={headerTitle}
				status={status}
				size="lg"
			/>
			<div className="min-w-0 flex-1 space-y-1">
				<h3 className="ds-chat-thread-title">{headerTitle}</h3>
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
				<Button
					onClick={openOutgoingCall}
					variant="ghost"
					size="icon"
					aria-label={t("a11y.call")}
				>
					<Phone className="ds-chat-icon-header" />
				</Button>
				<VoiceCallModal
					open={voiceCall.open}
					phase={voiceCall.phase}
					peer={{ ...currentChat, name: headerTitle }}
					onClose={endVoiceSession}
					onAccept={() =>
						setVoiceCall((v) => ({ ...v, phase: "active" }))
					}
				/>
			</div>
		</div>
	);
}
