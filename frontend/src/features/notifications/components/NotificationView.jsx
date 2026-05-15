import { Bell } from "lucide-react";
import { Button } from "@/design-system";
import { useTranslation } from "react-i18next";

export function NotificationView() {
	const { t } = useTranslation("notifications");

	return (
		<div className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 pt-5 sm:pt-10">
			<header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
				<div className="flex min-w-0 items-start gap-3">
					<Bell
						className="mt-0.5 size-6 shrink-0 text-primary"
						aria-hidden
					/>
					<div className="min-w-0 space-y-1">
						<h1 className="text-base font-bold uppercase tracking-wide text-primary sm:text-lg">
							{t("title")}
						</h1>
					</div>
				</div>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="w-full shrink-0 sm:w-auto sm:self-start"
				>
					{t("markAllRead")}
				</Button>
			</header>

			<section className="flex flex-col justify-center items-center gap-4">
                <div className="flex flex-col gap-2 items-center justify-center h-64">
                    <p className="text-sm text-muted-foreground">
                        {t("empty")}
                    </p>
                </div>

            </section>
		</div>
	);
}
