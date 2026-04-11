import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, UserRound, UsersRound, UserPlus, X } from "lucide-react";

import {
	Button,
	Input,
	Label,
	Modal,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/design-system";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { createDM, createGroup } from "@/features/chat/services/chatService";
import { getUserInfo } from "@/features/profile/services/profileService";

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
					onValueChange={onTabChange}
					className="w-full"
				>
					<TabsList
						variant="filled"
						className="grid w-full grid-cols-2 gap-1 p-1"
					>
						<TabsTrigger
							value={ADD_CONVERSATION_TAB.GROUP}
							className="flex items-center gap-2 text-xs sm:text-sm"
						>
							<UsersRound className="size-4 shrink-0" aria-hidden />
							{t("list.add.tabGroup")}
						</TabsTrigger>
						<TabsTrigger
							value={ADD_CONVERSATION_TAB.DM}
							className="flex items-center gap-2 text-xs sm:text-sm"
						>
							<UserRound className="size-4 shrink-0" aria-hidden />
							{t("list.add.tabDm")}
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value={ADD_CONVERSATION_TAB.GROUP}
						className="mt-4 space-y-2"
					>
						<Label htmlFor="group-name">
							Nome do Grupo
						</Label>
						<Input
							id="group-name"
							type="text"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							placeholder="Digite o nome do grupo"
							className="rounded-xl bg-input-background"
							autoComplete="off"
						/>

						<Label htmlFor={groupFieldId}>
							{t("list.add.groupMembersLabel")}
						</Label>
						<div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-2 sm:justify-end">
							<Input
								id={groupFieldId}
								type="text"
								value={groupQuery}
								onChange={(e) => {
									setGroupQuery(e.target.value);
									if (memberError) setMemberError(null);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddGroupMember();
									}
								}}
								placeholder={t("list.add.groupMembersPlaceholder")}
								className="rounded-xl bg-input-background flex-1"
								autoComplete="off"
								disabled={addingMember}
							/>
							<Button
								variant="primary"
								type="button"
								onClick={handleAddGroupMember}
								disabled={addingMember}
								className="h-10 px-3 flex-shrink-0 flex items-center justify-center"
								style={{ minWidth: "40px" }}
								aria-label={t("list.add.addMemberAria")}
							>
								<UserPlus className="size-5" aria-hidden />
							</Button>
						</div>

						{memberError && (
							<p className="text-sm text-destructive" role="alert">
								{memberError}
							</p>
						)}

						{groupMembers.length > 0 && (
							<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
								{groupMembers.map((member) => (
									<li
										key={member.id}
										className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2 py-1.5"
									>
										<span className="min-w-0 truncate">{member.displayLabel}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-8 shrink-0"
											onClick={() => removeGroupMember(member.id)}
											aria-label={t("list.add.removeMemberAria", {
												username: member.username,
											})}
										>
											<X className="size-4" aria-hidden />
										</Button>
									</li>
								))}
							</ul>
						)}
					</TabsContent>

					<TabsContent
						value={ADD_CONVERSATION_TAB.DM}
						className="mt-4 space-y-2"
					>
						<Label htmlFor={dmFieldId}>{t("list.add.dmUserLabel")}</Label>
						<Input
							id={dmFieldId}
							type="text"
							value={dmQuery}
							onChange={(e) => setDmQuery(e.target.value)}
							placeholder={t("list.add.dmUserPlaceholder")}
							className="rounded-xl bg-input-background"
							autoComplete="off"
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
