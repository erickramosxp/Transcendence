import { useTranslation } from "react-i18next";
import { Input, Label } from "@/design-system";

export function AddConversationDMForm({
	dmFieldId,
	dmQuery,
	onDmQueryChange,
	dmSuggestions,
	onSelectDmSuggestion,
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
			{dmSuggestions.length > 0 && (
				<ul className="mt-2 space-y-1 text-sm">
					{dmSuggestions.map((friend) => {
						const label = friend?.name?.trim()
							? `${friend.name} (@${friend.username})`
							: `@${friend.username}`;
						return (
							<li key={friend.friendId}>
								<button
									type="button"
									className="w-full rounded-lg border border-border/60 px-3 py-2 text-left text-foreground hover:bg-accent/50"
									onClick={() => onSelectDmSuggestion?.(friend)}
								>
									{label}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
