/**
 *  Aparece em TODAS as telas internas. Logo + links + ThemeToggle + LanguageSwitcher + Sair:
 * <SidebarNav activeItem="feed | messages | notifications | friends | profile" />
 */

import { Link } from 'react-router-dom'
import { Separator } from '../primitives';

export function SideBarNav({ items, actions }) {

	return (
		<nav className="sticky top-0 h-screen flex flex-col gap-2 underline p-4 border-r w-48 shrink-0 hidden lg:flex stick">
			{/* Links / top */}
			<div className="flex flex-col gap-2 flex-1">
				{items.map((item) => (
					<Link key={item.to} to={item.to}>
						{item.label}
					</Link>
				))}
			</div>

				<Separator />
			{/* Actions / footer */}
			<div className="mt-auto">
				{actions}
			</div>
		</nav>
	);
}
