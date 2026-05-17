import { Avatar } from "../primitives/Avatar/Avatar";
import { cn } from "../tokens/colors";

export function NotificationItem({
	accentClassName,
	icon: Icon,
	iconClassName,
	avatar,
	message,
	timeLabel,
	unread = false,
	disabled = false,
	busy = false,
	onActivate,
	openLabel,
	className,
}) {
	return (
		<article
			className={cn(
				"flex w-full overflow-hidden rounded-xl border border-border/50 bg-card/70 transition-colors",
				unread && "bg-card/95",
				disabled && "opacity-60",
				className,
			)}
		>
			<span
				className={cn("w-1 shrink-0", accentClassName)}
				aria-hidden
			/>
			<div className="flex min-w-0 flex-1 items-center gap-3 p-3">
				<Avatar
					className="shrink-0"
					size="md"
					src={avatar?.src}
					name={avatar?.name}
					username={avatar?.username}
				/>

				<button
					type="button"
					className="flex min-w-0 flex-1 items-start gap-2 rounded-lg -m-1 p-1 text-left transition-colors hover:bg-accent/30 disabled:opacity-60"
					disabled={disabled}
					aria-busy={busy}
					onClick={onActivate}
					aria-label={openLabel}
				>
					{Icon ? (
						<Icon
							className={cn(
								"mt-0.5 size-4 shrink-0",
								iconClassName,
							)}
							aria-hidden
						/>
					) : null}

					<div className="min-w-0 flex-1">
						<p className="text-sm leading-snug">
							{message}
						</p>
						{timeLabel ? (
							<p className="mt-1 text-xs text-muted-foreground">
								{timeLabel}
							</p>
						) : null}
					</div>
				</button>

				{unread ? (
					<span
						className="size-2.5 shrink-0 rounded-full bg-primary"
						aria-hidden
					/>
				) : (
					<span className="size-2.5 shrink-0" aria-hidden />
				)}
			</div>
		</article>
	);
}
