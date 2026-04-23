import { UserPlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Label } from "@/design-system";

export function AddConversationGroupForm({
	groupName,
	onGroupNameChange,
	groupFieldId,
	groupQuery,
	onGroupQueryChange,
	onGroupQueryKeyDown,
	onAddGroupMember,
	addingMember,
	memberError,
	groupMembers,
	onRemoveGroupMember,
}) {
	const { t } = useTranslation("chat");

	return (
		<div className="mt-4 space-y-2">
			<Label htmlFor="group-name">{t("list.add.groupNameLabel")}</Label>
			<Input
				id="group-name"
				type="text"
				value={groupName}
				onChange={onGroupNameChange}
				placeholder={t("list.add.groupNamePlaceholder")}
				className="rounded-xl bg-input-background"
				autoComplete="off"
			/>

			<Label htmlFor={groupFieldId}>{t("list.add.groupMembersLabel")}</Label>
			<div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-2 sm:justify-end">
				<Input
					id={groupFieldId}
					type="text"
					value={groupQuery}
					onChange={onGroupQueryChange}
					onKeyDown={onGroupQueryKeyDown}
					placeholder={t("list.add.groupMembersPlaceholder")}
					className="rounded-xl bg-input-background flex-1"
					autoComplete="off"
					disabled={addingMember}
				/>
				<Button
					variant="primary"
					type="button"
					onClick={onAddGroupMember}
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
								onClick={() => onRemoveGroupMember(member.id)}
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
		</div>
	);
}
