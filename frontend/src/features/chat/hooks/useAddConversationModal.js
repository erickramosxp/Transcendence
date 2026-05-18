import { useCallback, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { createDM, createGroup } from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { getUserInfo } from "@/features/profile/services/profileService";
import {
	axiosErrorMessage,
	getFriendDisplayLabel,
	normalizeUsername,
} from "@/features/chat/utils/ConversationModalUtils";
import { resolveFriendForChat } from "@/features/chat/utils/resolveFriendForChat";
import { useDebouncedFriendSuggestions } from "@/features/chat/hooks/useDebouncedFriendSuggestions";
import { LIMITS } from "@/shared/validation/limits";

export const ADD_CONVERSATION_TAB = {
	GROUP: "chat-group",
	DM: "chat-dm",
};

/**
 * @param {{
 *   activeTab: string;
 *   onChatCreated?: (chat: unknown, meta?: { peerLabel?: string }) => void;
 *   onClose?: () => void;
 * }} params
 */
export function useAddConversationModal({ activeTab, onChatCreated, onClose }) {
	const { t } = useTranslation("chat");
	const groupFieldId = useId();
	const dmFieldId = useId();

	const [groupMembers, setGroupMembers] = useState([]);
	const [groupName, setGroupName] = useState("");
	const [groupQuery, setGroupQuery] = useState("");
	const [dmQuery, setDmQuery] = useState("");
	const [memberError, setMemberError] = useState(null);
	const [addingMember, setAddingMember] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const excludeGroupFriendIds = useMemo(
		() => new Set(groupMembers.map((m) => String(m.id))),
		[groupMembers],
	);

	const [dmSuggestions, setDmSuggestions] = useDebouncedFriendSuggestions(dmQuery, {
		pageSize: 6,
	});

	const [groupSuggestions, setGroupSuggestions] = useDebouncedFriendSuggestions(groupQuery, {
		pageSize: 8,
		excludeFriendIds: excludeGroupFriendIds,
	});

	const resetFormState = useCallback(() => {
		setGroupQuery("");
		setGroupMembers([]);
		setGroupName("");
		setDmQuery("");
		setMemberError(null);
		setAddingMember(false);
		setSubmitError(null);
		setSubmitting(false);
		setDmSuggestions([]);
		setGroupSuggestions([]);
	}, [setDmSuggestions, setGroupSuggestions]);

	const handleClose = useCallback(() => {
		resetFormState();
		onClose?.();
	}, [onClose, resetFormState]);

	const removeGroupMember = useCallback((userId) => {
		setSubmitError(null);
		setGroupMembers((prev) => prev.filter((m) => m.id !== userId));
	}, []);

	const addGroupMemberByUser = useCallback((user) => {
		const id = user?.friendId ?? user?.id;
		const username = user?.username;
		if (id == null || !username) return;

		setGroupMembers((prev) => {
			if (prev.some((m) => String(m.id) === String(id))) return prev;
			return [
				...prev,
				{
					id: Number(id),
					username,
					displayLabel: getFriendDisplayLabel(user),
				},
			];
		});
		setGroupQuery("");
		setGroupSuggestions([]);
		setMemberError(null);
		setSubmitError(null);
	}, [setGroupSuggestions]);

	const handleAddGroupMember = useCallback(async () => {
		setMemberError(null);
		const username = normalizeUsername(groupQuery);
		if (!username) {
			setMemberError(t("list.add.memberErrorEmpty"));
			return;
		}

		const me = readCurrentUserId();

		if (groupMembers.some((m) => m.username.toLowerCase() === username.toLowerCase())) {
			setMemberError(t("list.add.memberErrorDuplicate"));
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
					if (uid != null && String(uid) === String(me)) {
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
			if (groupMembers.some((m) => String(m.id) === String(id))) {
				setMemberError(t("list.add.memberErrorDuplicate"));
				return;
			}

			const uname = friend.username ?? username;
			const displayLabel = getFriendDisplayLabel(friend);

			setGroupMembers((prev) => [...prev, { id: Number(id), username: uname, displayLabel }]);
			setGroupQuery("");
			setSubmitError(null);
		} catch (e) {
			setMemberError(t("list.add.memberErrorGeneric"));
		} finally {
			setAddingMember(false);
		}
	}, [groupMembers, groupQuery, t]);

	const handleCreate = useCallback(async () => {
		setSubmitError(null);
		const me = readCurrentUserId();

		if (activeTab === ADD_CONVERSATION_TAB.DM) {
			const username = normalizeUsername(dmQuery);
			if (!username) {
				setSubmitError(t("list.add.createErrorDmUsername"));
				return;
			}
			setSubmitting(true);
			try {
				let friend;
				try {
					friend = await resolveFriendForChat(username);
				} catch {
					setSubmitError(t("list.add.memberErrorGeneric"));
					return;
				}
				let otherId = friend?.friendId;
				if (otherId == null) {
					try {
						const user = await getUserInfo(username);
						const uid = user?.id;
						if (uid != null && String(uid) === String(me)) {
							setSubmitError(t("list.add.createErrorDmSelf"));
							return;
						}
					} catch (e) {
						if (e?.response?.status === 404) {
							setSubmitError(t("list.add.memberErrorNotFound", { username }));
						} else {
							setSubmitError(t("list.add.memberErrorGeneric"));
						}
						return;
					}
					setSubmitError(t("list.add.memberErrorNotFriend", { username }));
					return;
				}
				const chat = await createDM(Number(otherId));
				const peerLabel = getFriendDisplayLabel(friend);
				onChatCreated?.(chat, { peerLabel });
				handleClose();
			} catch (e) {
				if (e?.response?.status === 403) {
					setSubmitError(t("list.add.createErrorForbidden"));
				} else {
					setSubmitError(axiosErrorMessage(e) ?? t("list.add.createErrorGeneric"));
				}
			} finally {
				setSubmitting(false);
			}
			return;
		}

		const name = groupName.trim();
		if (!name) {
			setSubmitError(t("list.add.createErrorGroupName"));
			return;
		}
		if (name.length > LIMITS.groupNameMax) {
			setSubmitError(
				t("list.add.createErrorGroupNameTooLong", { max: LIMITS.groupNameMax }),
			);
			return;
		}
		if (groupMembers.length === 0) {
			setSubmitError(t("list.add.createErrorNoMembers"));
			return;
		}

		setSubmitting(true);
		try {
			const participantIds = groupMembers.map((m) => m.id);
			const chat = await createGroup(name, participantIds);
			onChatCreated?.(chat);
			handleClose();
		} catch (e) {
			if (e?.response?.status === 403) {
				setSubmitError(t("list.add.createErrorForbidden"));
			} else {
				setSubmitError(axiosErrorMessage(e) ?? t("list.add.createErrorGeneric"));
			}
		} finally {
			setSubmitting(false);
		}
	}, [
		activeTab,
		dmQuery,
		groupMembers,
		groupName,
		handleClose,
		onChatCreated,
		t,
	]);

	const clearTabErrors = useCallback(() => {
		setMemberError(null);
		setSubmitError(null);
	}, []);

	return {
		t,
		groupFieldId,
		dmFieldId,
		groupMembers,
		groupName,
		setGroupName,
		groupQuery,
		setGroupQuery,
		dmQuery,
		setDmQuery,
		memberError,
		setMemberError,
		addingMember,
		submitError,
		setSubmitError,
		submitting,
		dmSuggestions,
		setDmSuggestions,
		groupSuggestions,
		handleClose,
		removeGroupMember,
		addGroupMemberByUser,
		handleAddGroupMember,
		handleCreate,
		clearTabErrors,
		groupNameMaxLength: LIMITS.groupNameMax,
	};
}
