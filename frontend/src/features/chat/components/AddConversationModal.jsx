import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, UserRound, UsersRound } from "lucide-react";

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

export const ADD_CONVERSATION_TAB = {
	GROUP: "chat-group",
	DM: "chat-dm",
};

export function AddConversationModal({ open, onClose, activeTab, onTabChange }) {
	const { t } = useTranslation("chat");
	const groupFieldId = useId();
	const dmFieldId = useId();
	const [groupQuery, setGroupQuery] = useState("");
	const [dmQuery, setDmQuery] = useState("");

	function handleClose() {
		setGroupQuery("");
		setDmQuery("");
		onClose?.();
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title={t("list.add.title")}
			size="sm"
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
						<Label htmlFor={groupFieldId}>{t("list.add.groupMembersLabel")}</Label>
						<Input
							id={groupFieldId}
							type="text"
							value={groupQuery}
							onChange={(e) => setGroupQuery(e.target.value)}
							placeholder={t("list.add.groupMembersPlaceholder")}
							className="rounded-xl bg-input-background"
							autoComplete="off"
						/>
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

				<div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
					<Button variant="secondary" type="button" onClick={handleClose}>
						{t("list.add.cancel")}
					</Button>
					<Button variant="primary" type="button">
						<MessageCirclePlus className="size-4 shrink-0 sm:size-5" />
						{t("list.add.create")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
