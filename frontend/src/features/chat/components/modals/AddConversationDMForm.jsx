import { useTranslation } from "react-i18next";

import { Input, Label } from "@/design-system";

export function AddConversationDMForm({
	dmFieldId,
	dmQuery,
	onDmQueryChange,
}) {
	const { t } = useTranslation("chat");

	return (
		<div className="mt-4 space-y-2">
			<Label htmlFor={dmFieldId}>{t("list.add.dmUserLabel")}</Label>
			<Input
				id={dmFieldId}
				type="text"
				value={dmQuery}
				onChange={onDmQueryChange}
				placeholder={t("list.add.dmUserPlaceholder")}
				className="rounded-xl bg-input-background"
				autoComplete="off"
			/>
		</div>
	);
}
