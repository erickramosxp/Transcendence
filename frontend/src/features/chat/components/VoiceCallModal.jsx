import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { AvatarWithStatus, Button, Modal } from "@/design-system";

const PHASES = ["incoming", "outgoing", "active"];

function formatMmSs(totalSeconds) {
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ActiveCallDuration() {
	const [sec, setSec] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setSec((s) => s + 1), 1000);
		return () => clearInterval(id);
	}, []);
	return (
		<span className="ds-chat-voice-modal__duration">{formatMmSs(sec)}</span>
	);
}

export function VoiceCallModal({
	open,
	onClose,
	phase,
	peer,
	onAccept,
	onDecline,
	onCancelOutgoing,
	onHangUp,
}) {
	const { t } = useTranslation("chat");
	const safePhase = PHASES.includes(phase) ? phase : "outgoing";
	const status = peer?.status ?? "online";
	const name = peer?.name?.trim() || t("peerFallback");
	const [micOn, setMicOn] = useState(true);

	function handleRequestClose() {
		if (safePhase === "incoming") onDecline?.();
		else if (safePhase === "outgoing") onCancelOutgoing?.();
		else if (safePhase === "active") onHangUp?.();
		onClose?.();
	}

	function handleAccept() {
		onAccept?.();
	}

	return (
		<Modal
			open={open}
			title={t(`call.title.${safePhase}`)}
			onClose={handleRequestClose}
			size="md"
			scrollMode="none"
		>
			<div className="ds-chat-voice-modal">
				<AvatarWithStatus
					src={peer?.avatar}
					name={name}
					status={status}
					size="xl"
					className="ds-chat-voice-modal__avatar"
				/>
				<p className="ds-chat-voice-modal__name">{name}</p>
				<p className="ds-chat-voice-modal__hint">
					{t(`call.hint.${safePhase}`, { name })}
				</p>
				{safePhase === "active" ? <ActiveCallDuration /> : null}

				<div className="ds-chat-voice-modal__actions">
					{safePhase === "incoming" ? (
						<>
							<Button
								type="button"
								variant="destructive"
								size="rounded"
								aria-label={t("call.a11y.decline")}
								onClick={handleRequestClose}
							>
								<PhoneOff
									className="ds-chat-voice-modal__icon-call"
									aria-hidden
								/>
							</Button>
							<Button
								type="button"
								variant="primary"
								size="rounded"
								aria-label={t("call.a11y.accept")}
								onClick={handleAccept}
							>
								<Phone
									className="ds-chat-voice-modal__icon-call"
									aria-hidden
								/>
							</Button>
						</>
					) : null}

					{safePhase === "outgoing" ? (
						<Button
							type="button"
							variant="outline"
							size="default"
							onClick={handleRequestClose}
						>
							{t("call.cancelOutgoing")}
						</Button>
					) : null}

					{safePhase === "active" ? (
						<>
							<Button
								type="button"
								variant={micOn ? "ghost" : "secondary"}
								size="icon"
								className="ds-chat-input-icon-btn rounded-full"
								aria-label={
									micOn ? t("call.a11y.mute") : t("call.a11y.unmute")
								}
								onClick={() => setMicOn((v) => !v)}
							>
								{micOn ? (
									<Mic
										className="ds-chat-voice-modal__icon-mic"
										aria-hidden
									/>
								) : (
									<MicOff
										className="ds-chat-voice-modal__icon-mic"
										aria-hidden
									/>
								)}
							</Button>
							<Button
								type="button"
								variant="destructive"
								size="rounded"
								aria-label={t("call.a11y.hangUp")}
								onClick={handleRequestClose}
							>
								<PhoneOff
									className="ds-chat-voice-modal__icon-call"
									aria-hidden
								/>
							</Button>
						</>
					) : null}
				</div>
			</div>
		</Modal>
	);
}
