import { NavLink } from 'react-router-dom'
import { cn } from '@/design-system/tokens/colors'
import { Separator } from '../primitives'
import { BrandHeader } from './BrandHeader'
import { buttonVariants } from '../primitives/Button/Button'

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
							{item.label}
						</NavLink>
					)
				})}
			</div>

			<Separator className="my-3" />
			<div className="mt-auto">{actions}</div>
		</nav>
	)
}
