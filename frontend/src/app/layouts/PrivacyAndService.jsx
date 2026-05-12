import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, FileText } from 'lucide-react'
import { cn } from '@/design-system/tokens/colors'
import { buttonVariants } from '@/design-system/primitives/Button/Button'

export function PrivacyAndService() {
	const { t } = useTranslation('common')

	return (
		<div className="flex flex-col gap-0.5 mt-2">
			<Link
				to="/"
				className={cn(
					buttonVariants({ size: "nav", variant: "ghost" }),
					"text-xs font-normal text-muted-foreground px-2 py-1"
				)}
			>
				<ShieldCheck className="size-4 shrink-0 stroke-[1.75]" aria-hidden />
				{t('privacyAndService.privacy')}
			</Link>
			<Link
				to="/"
				className={cn(
					buttonVariants({ size: "nav", variant: "ghost" }),
					"text-xs font-normal text-muted-foreground px-2 py-1"
				)}
			>
				<FileText className="size-4 shrink-0 stroke-[1.75]" aria-hidden />
				{t('privacyAndService.termsOfService')}
			</Link>
		</div>
	);
}
