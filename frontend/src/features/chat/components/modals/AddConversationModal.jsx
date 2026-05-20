import { MessageCirclePlus, UserRound, UsersRound } from "lucide-react";

import {
	Button,
	Modal,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/design-system";
import { AddConversationDMForm } from "@/features/chat/components/modals/AddConversationDMForm";
import { AddConversationGroupForm } from "@/features/chat/components/modals/AddConversationGroupForm";
import {
	ADD_CONVERSATION_TAB,
	useAddConversationModal,
} from "@/features/chat/hooks/useAddConversationModal";

export { ADD_CONVERSATION_TAB };

export function AddConversationModal({
	open,
	onClose,
	activeTab,
	onTabChange,
	onChatCreated,
}) {
	const modal = useAddConversationModal({ activeTab, onChatCreated, onClose });
	const { t } = modal;

	return (
		<Modal
			open={open}
			onClose={modal.handleClose}
			title={t("list.add.title")}
			size="xl"
			scrollMode="none"
		>
			<div className="flex flex-col gap-4 sm:gap-5">
				<Tabs
					value={activeTab}
					onValueChange={(nextTab) => {
						modal.clearTabErrors();
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
							groupName={modal.groupName}
							groupNameMaxLength={modal.groupNameMaxLength}
							onGroupNameChange={(e) => {
								modal.setGroupName(e.target.value);
								if (modal.submitError) modal.setSubmitError(null);
							}}
							groupFieldId={modal.groupFieldId}
							groupQuery={modal.groupQuery}
							onGroupQueryChange={(e) => {
								modal.setGroupQuery(e.target.value);
								if (modal.memberError) modal.setMemberError(null);
								if (modal.submitError) modal.setSubmitError(null);
							}}
							onGroupQueryKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									modal.handleAddGroupMember();
								}
							}}
							onAddGroupMember={modal.handleAddGroupMember}
							addingMember={modal.addingMember}
							memberError={modal.memberError}
							groupSuggestions={modal.groupSuggestions}
							onSelectGroupSuggestion={modal.addGroupMemberByUser}
							groupMembers={modal.groupMembers}
							onRemoveGroupMember={modal.removeGroupMember}
						/>
					</TabsContent>

					<TabsContent value={ADD_CONVERSATION_TAB.DM}>
						<AddConversationDMForm
							dmFieldId={modal.dmFieldId}
							dmQuery={modal.dmQuery}
							onDmQueryChange={(e) => {
								modal.setDmQuery(e.target.value);
								if (modal.submitError) modal.setSubmitError(null);
							}}
							dmSuggestions={modal.dmSuggestions}
							onSelectDmSuggestion={(friend) => {
								modal.setDmQuery(friend?.username ? `@${friend.username}` : "");
								modal.setDmSuggestions([]);
							}}
						/>
					</TabsContent>
				</Tabs>

				{modal.submitError && (
					<p className="text-sm text-destructive" role="alert">
						{modal.submitError}
					</p>
				)}

				<div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
					<Button
						variant="secondary"
						type="button"
						onClick={modal.handleClose}
						disabled={modal.submitting}
					>
						{t("list.add.cancel")}
					</Button>
					<Button
						variant="primary"
						type="button"
						onClick={modal.handleCreate}
						disabled={modal.submitting || modal.addingMember}
					>
						<MessageCirclePlus className="size-4 shrink-0 sm:size-5" />
						{modal.submitting ? t("list.add.creating") : t("list.add.create")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
