import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import Message from "@/features/chat/components/Message";
import ChatDaySeparator from "@/features/chat/components/ChatDaySeparator";
import MessageInput from "@/features/chat/components/MessageInput";
import { getMessages, sendMessages, mapApiMessageToUi } from "@/features/chat/chatService";
import { MessageCircle, ChevronLeft, Phone, Video } from "lucide-react";
import { AvatarWithStatus } from "@/design-system";
import { Separator } from "@/design-system";
import { Button } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";
import {
	formatChatDaySeparatorLabel,
	isSameChatDay,
} from "@/features/chat/utils/formatChatDates";

function readCurrentUserId() {
	try {
		const raw = localStorage.getItem('@trascendence:user');
		if (!raw) return 1;
		const u = JSON.parse(raw);
		return u?.id ?? 1;
	} catch {
			return 1;
	}
}

export default function ChatWindow({ currentChat, onBack }) {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [nextCursor, setNextCursor] = useState(null);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const listRef = useRef(null);

	const currentUserId = readCurrentUserId();
	const { t } = useTranslation("chat");
	const peerName = currentChat?.name ?? t("peerFallback");
	const { currentLanguage } = useLanguage();

	useEffect(() => {

		if (!currentChat){
			setMessages([]);
			setNextCursor(null);
			setError(null);
			return ;
		}

		const convId = currentChat.id;
		let cancelled = false;

		(async () => {
			setLoading(true);
			setError(null);
			setNextCursor(null);
			try {
				const data = await getMessages(convId, { limit: 50 });
				if (cancelled) return;
				const ui = data.messages.map((m) =>
				mapApiMessageToUi(m, currentUserId, peerName),
				);
				setMessages(ui);
				setNextCursor(data.nextCursor ?? null);
			} catch (e) {
				if (!cancelled) setError(e?.message ?? t("errors.load"));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [currentChat?.id, currentUserId, peerName]);

	const loadOlder = useCallback(async () =>{
		if (!currentChat || !nextCursor || loadingOlder) return;

		const el = listRef.current;
		const prevH = el?.scrollHeight ?? 0;

		setLoadingOlder(true);
		try {
			const data = await getMessages(currentChat.id, {
				limit: 50,
				before: nextCursor,
			});
			const ui = data.messages.map((m) =>
				mapApiMessageToUi(m, currentUserId, peerName),
		);
		setMessages((prev) => [...ui, ...prev]);
		setNextCursor(data.nextCursor ?? null);
		requestAnimationFrame(() => {
			if (el) el.scrollTop = el.scrollHeight - prevH;
		});
		} finally {
			setLoadingOlder(false);
		}

	}, [currentChat, nextCursor, loadingOlder, currentUserId, peerName]);

	function onScroll(e) {
		if (e.target.scrollTop < 80) loadOlder();
	}

	async function handleSendMessage(text) {
		if (!currentChat) return;
		try {
			const created = await sendMessages(currentChat.id, text, currentUserId);
			const ui = mapApiMessageToUi(created, currentUserId, peerName);
			setMessages((prev) => [...prev, ui]);
			requestAnimationFrame(() => {
				if (listRef.current)
					listRef.current.scrollTop = listRef.current.scrollHeight;
			});
		} catch (e) {
			setError(e?.message ?? t("errors.send"));
		}
	}

	if (!currentChat) {
		return (
			<div
				className={cn(
					"flex flex-1 flex-col items-center justify-center px-6",
					"[background:var(--chat-window-surface)]",
				)}
			>
				<div
					className={cn(
						"mb-6 flex size-16 items-center justify-center rounded-2xl",
						"bg-gradient-to-br from-[#6e93c4] via-[#4a78b5] to-[#3b6091] text-primary-foreground shadow-lg shadow-primary/25",
					)}
					aria-hidden
				>
					<MessageCircle className="size-8" strokeWidth={1.75} />
				</div>
				<h3 className="text-center text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
					{t("empty.title")}
				</h3>
				<p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
					{t("empty.hint")}
				</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex min-h-0 flex-1 flex-col",
				"[background:var(--chat-window-surface)]",
			)}
		>
			<div className="flex shrink-0 items-center gap-3 px-4 pb-4 pt-5 sm:gap-4 sm:px-6 sm:pb-4 sm:pt-6">
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
					status={currentChat.status ?? "online"}
					size="lg"
				/>
				<div className="min-w-0 flex-1 space-y-1">
					<h3 className="truncate text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
						{currentChat.name}
					</h3>
					<span
						className={cn(
							"block text-xs font-medium leading-none sm:text-[13px]",
							(currentChat.status ?? "online") === "online"
								? "text-[var(--color-online)]"
								: "text-muted-foreground",
						)}
					>
						{(currentChat.status ?? "online") === "online"
							? t("status.online")
							: t("status.offline")}
					</span>
				</div>
				<div className="flex shrink-0 gap-1 sm:gap-2">
					<Button variant="ghost" size="icon" aria-label={t("a11y.call")}>
						<Phone className="size-[1.15rem] sm:size-5" />
					</Button>
					<Button variant="ghost" size="icon" aria-label={t("a11y.video")}>
						<Video className="size-[1.15rem] sm:size-5" />
					</Button>
				</div>
			</div>
			<Separator />
			{error && (
				<p className="shrink-0 px-4 py-2 text-sm text-destructive sm:px-6" role="alert">
					{error}
				</p>
			)}
			{loading && (
				<p className="shrink-0 px-4 py-2 text-sm text-muted-foreground sm:px-6">
					{t("loading.messages")}
				</p>
			)}
			<div
				ref={listRef}
				onScroll={onScroll}
				className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1 sm:px-5"
			>
				{loadingOlder && (
					<p className="py-2 text-center text-xs text-muted-foreground">
						{t("loading.older")}
					</p>
				)}
				{messages.length > 0 ? (
					messages.map((msg, idx) => {
						const prev = messages[idx - 1];
						const showDay =
							idx === 0 ||
							!prev ||
							!isSameChatDay(msg.timestamp, prev.timestamp);
						const dayLabel = showDay
							? formatChatDaySeparatorLabel(msg.timestamp, currentLanguage, {
									today: t("day.today"),
									yesterday: t("day.yesterday"),
								})
							: null;
						return (
							<Fragment key={msg.id}>
								{showDay && <ChatDaySeparator label={dayLabel} />}
								<Message currentUserId={currentUserId} message={msg} />
							</Fragment>
						);
					})
				) : (
					<p className="mt-8 text-center text-sm text-muted-foreground">
						{t("thread.empty")}
					</p>
				)}
			</div>

			<div className="shrink-0 border-t border-border bg-card/80 px-3 py-2.5 backdrop-blur-sm sm:px-5">
				<MessageInput onSendMessage={handleSendMessage} />
			</div>
		</div>
	);
}
