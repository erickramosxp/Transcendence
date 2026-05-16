import { NavLink } from 'react-router-dom'
import { cn } from '@/design-system/tokens/colors'
import { Separator } from '../primitives'
import { BrandHeader } from './BrandHeader'
import { buttonVariants } from '../primitives/Button/Button'
import { PrivacyAndService } from '@/app/layouts/PrivacyAndService'

export function SideBarNav({ items, actions }) {
	return (
		<nav className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r border-border bg-card p-4 lg:flex">
			<div className="mb-6">
				<BrandHeader layout="inline" size="sm" />
			</div>

			<div className="flex flex-1 flex-col gap-1">
				{items.map((item) => {
					const Icon = item.icon
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={({ isActive }) =>
								cn(
									buttonVariants({
										size: 'nav',
										variant: isActive ? 'nav-active' : 'nav-inactive',
									}),
								)
							}
						>
							{Icon ? <Icon className="size-5 shrink-0 stroke-[1.75]" aria-hidden /> : null}
							<span className="min-w-0 truncate">{item.label}</span>
							{item.badge > 0 ? (
								<span
									className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground"
									aria-label={`${item.badge} não lidas`}
								>
									{item.badge > 99 ? "99+" : item.badge}
								</span>
							) : null}
						</NavLink>
					)
				})}
			</div>

			<PrivacyAndService />
			<Separator className="my-3" />
			<div className="mt-auto">{actions}</div>
		</nav>
	)
}


