import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "@/design-system/components/Modal";
import { Avatar, Button, Input, Label } from "@/design-system";
import {
	addChatParticipant,
	CHAT_PARTICIPANTS_PAGE_SIZE,
	getChatParticipants,
	removeChatParticipant,
} from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import {
	axiosErrorMessage,
	getFriendDisplayLabel,
	normalizeUsername,
} from "@/features/chat/utils/ConversationModalUtils";
import { resolveFriendForChat } from "@/features/chat/utils/resolveFriendForChat";
import { useDebouncedFriendSuggestions } from "@/features/chat/hooks/useDebouncedFriendSuggestions";
import { getUserInfo } from "@/features/profile/services/profileService";
import { cn } from "@/design-system/tokens/colors";

function isAdminRole(role) {
	return String(role ?? "").toLowerCase() === "admin";
}

const PARTICIPANT_LIST_SCROLL_AFTER = 5;

export default function GroupParticipantsModal({ open, onClose, chatId }) {
	const { t } = useTranslation("chat");
	const fieldId = useId();
	const currentUserId = readCurrentUserId();

	const [items, setItems] = useState([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [resolvingRole, setResolvingRole] = useState(false);
	const [myRole, setMyRole] = useState(null);

	const [addQuery, setAddQuery] = useState("");
	const [memberError, setMemberError] = useState(null);
	const [addingMember, setAddingMember] = useState(false);
	const [removingId, setRemovingId] = useState(null);

	const participantIdSet = useMemo(
		() => new Set(items.map((p) => String(p.id))),
		[items],
	);

	const [addSuggestions, setAddSuggestions] = useDebouncedFriendSuggestions(addQuery, {
		pageSize: 8,
		excludeFriendIds: participantIdSet,
	});

	const isAdmin = isAdminRole(myRole);

	const mergeParticipants = useCallback((prev, incoming) => {
		const seen = new Set(prev.map((p) => String(p.id)));
		const next = [...prev];
		for (const p of incoming) {
			const id = String(p.id);
			if (seen.has(id)) continue;
			seen.add(id);
			next.push(p);
		}
		return next;
	}, []);

	const applySelfRole = useCallback(
		(list) => {
			const self = list.find((p) => Number(p.id) === Number(currentUserId));
			if (self?.role != null) setMyRole(self.role);
		},
		[currentUserId],
	);

	const fetchPage = useCallback(
		async (pageIndex, { append } = { append: false }) => {
			const data = await getChatParticipants(chatId, {
				page: pageIndex,
				size: CHAT_PARTICIPANTS_PAGE_SIZE,
			});
			const chunk = Array.isArray(data?.items) ? data.items : [];
			setHasMore(!!data?.hasMore);
			setPage(pageIndex);
			if (append) {
				setItems((prev) => {
					const merged = mergeParticipants(prev, chunk);
					applySelfRole(merged);
					return merged;
				});
			} else {
				setItems(chunk);
				applySelfRole(chunk);
			}
			return { chunk, hasMore: !!data?.hasMore };
		},
		[applySelfRole, chatId, mergeParticipants],
	);

	useEffect(() => {
		if (!open || chatId == null) return;

		let cancelled = false;

		async function bootstrap() {
			setLoading(true);
			setResolvingRole(true);
			setMyRole(null);
			setItems([]);
			setAddQuery("");
			setMemberError(null);
			setAddSuggestions([]);
			try {
				let pageIndex = 0;
				let foundSelf = false;
				let accumulated = [];
				let lastHasMore = false;

				while (!cancelled) {
					const data = await getChatParticipants(chatId, {
						page: pageIndex,
						size: CHAT_PARTICIPANTS_PAGE_SIZE,
					});
					const chunk = Array.isArray(data?.items) ? data.items : [];
					lastHasMore = !!data?.hasMore;
					accumulated = mergeParticipants(accumulated, chunk);
					foundSelf = accumulated.some(
						(p) => Number(p.id) === Number(currentUserId),
					);
					if (!cancelled) {
						setItems(accumulated);
						applySelfRole(accumulated);
						setPage(pageIndex);
						setHasMore(lastHasMore);
					}
					if (foundSelf || !lastHasMore) break;
					pageIndex += 1;
					if (pageIndex > 40) break;
				}
			} catch (e) {
				if (!cancelled) {
					toast.error(
						axiosErrorMessage(e) ?? t("participants.errorLoad"),
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
					setResolvingRole(false);
				}
			}
		}

		bootstrap();
		return () => {
			cancelled = true;
		};
	}, [
		open,
		chatId,
		currentUserId,
		mergeParticipants,
		applySelfRole,
		t,
	]);

	const handleLoadMore = useCallback(async () => {
		if (!hasMore || loadingMore) return;
		setLoadingMore(true);
		try {
			await fetchPage(page + 1, { append: true });
		} catch (e) {
			toast.error(axiosErrorMessage(e) ?? t("participants.errorLoad"));
		} finally {
			setLoadingMore(false);
		}
	}, [fetchPage, hasMore, loadingMore, page, t]);

	const handleRemove = useCallback(
		async (userId) => {
			if (userId == null) return;
			setRemovingId(userId);
			try {
				await removeChatParticipant(chatId, userId);
				setItems((prev) => prev.filter((p) => Number(p.id) !== Number(userId)));
				toast.success(t("participants.removeSuccess"));
			} catch (e) {
				toast.error(axiosErrorMessage(e) ?? t("participants.errorRemove"));
			} finally {
				setRemovingId(null);
			}
		},
		[chatId, t],
	);

	const handleAddMember = useCallback(async () => {
		setMemberError(null);
		const username = normalizeUsername(addQuery);
		if (!username) {
			setMemberError(t("list.add.memberErrorEmpty"));
			return;
		}

		setAddingMember(true);
		try {
			const friend = await resolveFriendForChat(username);
			let id = friend?.friendId;
			if (id == null) {
				try {
					const user = await getUserInfo(username);
					const uid = user?.id;
					if (uid != null && String(uid) === String(currentUserId)) {
						setMemberError(t("list.add.memberErrorSelf"));
						return;
					}
				} catch (e) {
					if (e?.response?.status === 404) {
						setMemberError(t("list.add.memberErrorNotFound", { username }));
					} else {
						setMemberError(t("list.add.memberErrorGeneric"));
					}
					return;
				}
				setMemberError(t("list.add.memberErrorNotFriend", { username }));
				return;
			}

			if (participantIdSet.has(String(id))) {
				setMemberError(t("list.add.memberErrorDuplicate"));
				return;
			}

			await addChatParticipant(chatId, Number(id));
			const refreshed = await getChatParticipants(chatId, {
				page: 0,
				size: CHAT_PARTICIPANTS_PAGE_SIZE,
			});
			const chunk = Array.isArray(refreshed?.items) ? refreshed.items : [];
			const added = chunk.find((p) => Number(p.id) === Number(id));
			if (added) {
				setItems((prev) => mergeParticipants(prev, [added]));
			} else {
				setItems((prev) =>
					mergeParticipants(prev, [
						{
							id: Number(id),
							username: friend.username ?? username,
							name: friend.name ?? "",
							avatarUrl: friend.avatarUrl ?? null,
							role: "member",
						},
					]),
				);
			}
			setAddQuery("");
			setAddSuggestions([]);
			toast.success(t("participants.addSuccess"));
		} catch (e) {
			toast.error(axiosErrorMessage(e) ?? t("participants.errorAdd"));
		} finally {
			setAddingMember(false);
		}
	}, [
		addQuery,
		chatId,
		currentUserId,
		mergeParticipants,
		participantIdSet,
		setAddSuggestions,
		t,
	]);

	const onSelectSuggestion = useCallback(
		(friend) => {
			const id = friend?.friendId ?? friend?.id;
			const username = friend?.username;
			if (id == null || !username) return;
			if (participantIdSet.has(String(id))) return;
			setAddQuery(username);
			setMemberError(null);
			setAddSuggestions([]);
		},
		[participantIdSet, setAddSuggestions],
	);

	if (!open) return null;

	return (
		<Modal
			open={open}
			title={t("participants.title")}
			onClose={onClose}
			size="lg"
			scrollMode="content"
		>
			<div className="ds-chat-participants-modal-body">
				{isAdmin && !resolvingRole && (
					<div className="ds-chat-participants-add-section">
						<Label htmlFor={fieldId}>{t("participants.addSectionTitle")}</Label>
						<div className="ds-chat-participants-add-row">
							<Input
								id={fieldId}
								value={addQuery}
								onChange={(e) => {
									setAddQuery(e.target.value);
									setMemberError(null);
								}}
								placeholder={t("participants.addPlaceholder")}
								className="ds-chat-participants-add-input"
								autoComplete="off"
								disabled={addingMember}
							/>
							<Button
								variant="primary"
								type="button"
								onClick={handleAddMember}
								disabled={addingMember}
								className="ds-chat-participants-add-submit"
								aria-label={t("participants.addFriendAria")}
							>
								<UserPlus className="size-5" aria-hidden />
							</Button>
						</div>

						{addSuggestions.length > 0 && (
							<ul className="ds-chat-participants-suggestions">
								{addSuggestions.map((friend) => {
									const label = getFriendDisplayLabel(friend);
									return (
										<li key={friend.friendId}>
											<button
												type="button"
												className="ds-chat-participants-suggestion-btn"
												onClick={() => onSelectSuggestion(friend)}
											>
												{label}
											</button>
										</li>
									);
								})}
							</ul>
						)}

						{memberError && (
							<p className="ds-chat-participants-error-text" role="alert">
								{memberError}
							</p>
						)}
					</div>
				)}

				{loading && (
					<p className="ds-chat-participants-muted-text">
						{t("participants.loading")}
					</p>
				)}

				{!loading && items.length === 0 && (
					<p className="ds-chat-participants-muted-text">
						{t("participants.empty")}
					</p>
				)}

				{items.length > 0 && (
					<div
						className={cn(
							items.length > PARTICIPANT_LIST_SCROLL_AFTER &&
								"ds-chat-participants-list-host--scroll",
						)}
					>
						<ul
							className={cn(
								"ds-chat-participants-list",
								items.length > PARTICIPANT_LIST_SCROLL_AFTER &&
									"ds-chat-participants-list--inset",
							)}
						>
							{items.map((p) => {
								const isSelf = Number(p.id) === Number(currentUserId);
								const label =
									(p.name ?? "").trim() ||
									(p.username ? `@${p.username}` : "");
								const showRemove = isAdmin && !isSelf && !resolvingRole;

								return (
									<li key={p.id} className="ds-chat-participants-row">
										<Avatar
											src={p.avatarUrl}
											name={label}
											username={p.username}
											size="sm"
										/>
										<div className="min-w-0 flex-1">
											<p className="ds-chat-participants-name">
												{label}
												{isSelf && (
													<span className="ds-chat-participants-you-suffix">
														({t("participants.you")})
													</span>
												)}
											</p>
											{p.username && (
												<p className="ds-chat-participants-username">
													@{p.username}
												</p>
											)}
										</div>
										<span
											className={cn(
												"ds-chat-participants-role",
												isAdminRole(p.role)
													? "ds-chat-participants-role--admin"
													: "ds-chat-participants-role--member",
											)}
										>
											{isAdminRole(p.role)
												? t("participants.roleAdmin")
												: t("participants.roleMember")}
										</span>
										{showRemove && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="ds-chat-participants-remove-btn"
												disabled={removingId === p.id}
												onClick={() => handleRemove(p.id)}
												aria-label={t("participants.removeAria", {
													username: p.username ?? p.id,
												})}
											>
												<X className="size-4" aria-hidden />
											</Button>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				)}

				{hasMore && (
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleLoadMore}
						disabled={loadingMore}
					>
						{loadingMore
							? t("list.loadingMore")
							: t("participants.loadMore")}
					</Button>
				)}
			</div>
		</Modal>
	);
}
