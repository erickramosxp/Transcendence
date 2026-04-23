import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, UserRound, UsersRound } from "lucide-react";

import {
	Button,
	Modal,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/design-system";
import { createDM, createGroup } from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { getUserInfo } from "@/features/profile/services/profileService";
import { AddConversationDMForm } from "@/features/chat/components/modals/AddConversationDMForm";
import { AddConversationGroupForm } from "@/features/chat/components/modals/AddConversationGroupForm";

export const ADD_CONVERSATION_TAB = {
	GROUP: "chat-group",
	DM: "chat-dm",
};

function normalizeUsername(raw) {
	return String(raw ?? "")
		.trim()
		.replace(/^@+/, "");
}

function axiosErrorMessage(err) {
	const d = err?.response?.data;
	if (typeof d === "string") return d;
	if (d?.message) return d.message;
	if (Array.isArray(d?.violations)) {
		const v = d.violations[0];
		if (v?.message) return v.message;
	}
	return null;
}

export function AddConversationModal({
	open,
	onClose,
	activeTab,
	onTabChange,
	onChatCreated,
}) {
	const { t } = useTranslation("chat");
	const [groupMembers, setGroupMembers] = useState([]);
	const [groupName, setGroupName] = useState("");
	const groupFieldId = useId();
	const dmFieldId = useId();
	const [groupQuery, setGroupQuery] = useState("");
	const [dmQuery, setDmQuery] = useState("");
	const [memberError, setMemberError] = useState(null);
	const [addingMember, setAddingMember] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	function handleClose() {
		setGroupQuery("");
		setGroupMembers([]);
		setGroupName("");
		setDmQuery("");
		setMemberError(null);
		setAddingMember(false);
		setSubmitError(null);
		setSubmitting(false);
		onClose?.();
	}

	function removeGroupMember(userId) {
		setSubmitError(null);
		setGroupMembers((prev) => prev.filter((m) => m.id !== userId));
	}

	async function handleAddGroupMember() {
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
			const user = await getUserInfo(username);
			const id = user?.id;
			if (id == null) {
				setMemberError(t("list.add.memberErrorNotFound", { username }));
				return;
			}
			if (String(id) === String(me)) {
				setMemberError(t("list.add.memberErrorSelf"));
				return;
			}
			if (groupMembers.some((m) => String(m.id) === String(id))) {
				setMemberError(t("list.add.memberErrorDuplicate"));
				return;
			}

			const uname = user.username ?? username;
			const displayLabel = user.name?.trim() ? `${user.name} (@${uname})` : `@${uname}`;

			setGroupMembers((prev) => [
				...prev,
				{ id: Number(id), username: uname, displayLabel },
			]);
			setGroupQuery("");
			setSubmitError(null);
		} catch (e) {
			if (e?.response?.status === 404) {
				setMemberError(t("list.add.memberErrorNotFound", { username }));
			} else {
				setMemberError(t("list.add.memberErrorGeneric"));
			}
		} finally {
			setAddingMember(false);
		}
	}

	async function handleCreate() {
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
				let user;
				try {
					user = await getUserInfo(username);
				} catch (e) {
					if (e?.response?.status === 404) {
						setSubmitError(t("list.add.memberErrorNotFound", { username }));
					} else {
						setSubmitError(t("list.add.memberErrorGeneric"));
					}
					return;
				}
				const otherId = user?.id;
				if (otherId == null) {
					setSubmitError(t("list.add.memberErrorNotFound", { username }));
					return;
				}
				if (String(otherId) === String(me)) {
					setSubmitError(t("list.add.createErrorDmSelf"));
					return;
				}
				const chat = await createDM(Number(otherId));
				const uname = user.username ?? username;
				const peerLabel = user.name?.trim()
					? `${user.name} (@${uname})`
					: `@${uname}`;
				onChatCreated?.(chat, { peerLabel });
				handleClose();
			} catch (e) {
				setSubmitError(axiosErrorMessage(e) ?? t("list.add.createErrorGeneric"));
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
			setSubmitError(axiosErrorMessage(e) ?? t("list.add.createErrorGeneric"));
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title={t("list.add.title")}
			size="xl"
			scrollMode="none"
		>
			<div className="flex flex-col gap-4 sm:gap-5">
				<Tabs
					value={activeTab}
					onValueChange={(nextTab) => {
						setMemberError(null);
						setSubmitError(null);
						onTabChange?.(nextTab);
					}}
					className="w-full"
				>
					<TabsList
						variant="filled"
						className="grid w-full grid-cols-2 gap-1 p-1"
					>
						<TabsTrigger
							value={ADD_CONVERSATION_TAB.DM}
							className="flex items-center gap-2 text-xs sm:text-sm"
						>
							<UserRound className="size-4 shrink-0" aria-hidden />
							{t("list.add.tabDm")}
						</TabsTrigger>
						<TabsTrigger
							value={ADD_CONVERSATION_TAB.GROUP}
							className="flex items-center gap-2 text-xs sm:text-sm"
						>
							<UsersRound className="size-4 shrink-0" aria-hidden />
							{t("list.add.tabGroup")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value={ADD_CONVERSATION_TAB.GROUP}>
						<AddConversationGroupForm
							groupName={groupName}
							onGroupNameChange={(e) => {
								setGroupName(e.target.value);
								if (submitError) setSubmitError(null);
							}}
							groupFieldId={groupFieldId}
							groupQuery={groupQuery}
							onGroupQueryChange={(e) => {
								setGroupQuery(e.target.value);
								if (memberError) setMemberError(null);
								if (submitError) setSubmitError(null);
							}}
							onGroupQueryKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAddGroupMember();
								}
							}}
							onAddGroupMember={handleAddGroupMember}
							addingMember={addingMember}
							memberError={memberError}
							groupMembers={groupMembers}
							onRemoveGroupMember={removeGroupMember}
						/>
					</TabsContent>

					<TabsContent value={ADD_CONVERSATION_TAB.DM}>
						<AddConversationDMForm
							dmFieldId={dmFieldId}
							dmQuery={dmQuery}
							onDmQueryChange={(e) => {
								setDmQuery(e.target.value);
								if (submitError) setSubmitError(null);
							}}
						/>
					</TabsContent>
				</Tabs>

				{submitError && (
					<p className="text-sm text-destructive" role="alert">
						{submitError}
					</p>
				)}

				<div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
					<Button
						variant="secondary"
						type="button"
						onClick={handleClose}
						disabled={submitting}
					>
						{t("list.add.cancel")}
					</Button>
					<Button
						variant="primary"
						type="button"
						onClick={handleCreate}
						disabled={submitting || addingMember}
					>
						<MessageCirclePlus className="size-4 shrink-0 sm:size-5" />
						{submitting ? t("list.add.creating") : t("list.add.create")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
