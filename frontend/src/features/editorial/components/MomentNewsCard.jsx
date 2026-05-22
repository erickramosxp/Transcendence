import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Loading,
} from "@/design-system";
import { getHeadlines } from "@/features/editorial/services/editorialService";
import { NewsHeadlineItem } from "@/features/editorial/components/NewsHeadlineItem";
import {
	EDITORIAL_HEADLINES_LIMIT,
	EDITORIAL_USERNAME,
} from "@/shared/constants/editorial";
import { getCurrentTime } from "@/shared/getCurrentTime";
import { useLanguage } from "@/hooks/useLanguage";

const REFRESH_MS = 5 * 60 * 1000;

export function MomentNewsCard() {
	const { t } = useTranslation("feed");
	const { currentLanguage } = useLanguage();
	const [headlines, setHeadlines] = useState([]);
	const [updatedAt, setUpdatedAt] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const loadHeadlines = useCallback(async () => {
		try {
			setError(false);
			const data = await getHeadlines(EDITORIAL_HEADLINES_LIMIT);
			setHeadlines(data.items ?? []);
			setUpdatedAt(data.updatedAt ?? null);
		} catch {
			setError(true);
			setHeadlines([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadHeadlines();
		const interval = setInterval(loadHeadlines, REFRESH_MS);
		return () => clearInterval(interval);
	}, [loadHeadlines]);

	const openArticle = (url) => {
		if (url) {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	const updatedLabel =
		updatedAt &&
		t("momentNews.updated", {
			time: getCurrentTime(updatedAt, currentLanguage),
		});

	return (
		<Card className="bg-card/90 backdrop-blur-xl border-border">
			<CardHeader className="pb-0">
				<CardTitle>{t("sections.momentNews")}</CardTitle>
				{updatedLabel && (
					<p className="text-xs text-muted-foreground">{updatedLabel}</p>
				)}
			</CardHeader>
			<CardContent className="space-y-1 pt-2">
				{loading && (
					<div className="flex justify-center py-6">
						<Loading />
					</div>
				)}

				{!loading && error && (
					<p className="py-4 text-center text-sm text-muted-foreground">
						{t("momentNews.error")}
					</p>
				)}

				{!loading && !error && headlines.length === 0 && (
					<p className="py-4 text-center text-sm text-muted-foreground">
						{t("momentNews.empty")}
					</p>
				)}

				{!loading &&
					!error &&
					headlines.map((item) => (
						<NewsHeadlineItem
							key={item.sourceUrl ?? item.postId}
							headline={item}
							onOpen={openArticle}
						/>
					))}

				{!loading && !error && headlines.length > 0 && (
					<Link
						to={`/${EDITORIAL_USERNAME}`}
						className="mt-2 block text-center text-sm font-medium text-primary hover:underline"
					>
						{t("momentNews.viewAll")}
					</Link>
				)}
			</CardContent>
		</Card>
	);
}
