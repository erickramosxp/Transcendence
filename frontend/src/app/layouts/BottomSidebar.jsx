import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/design-system/tokens/colors"
import { Home, MessageCircle, Bell, Users, User } from "lucide-react"
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore"

export function BottomSidebar() {
	const location = useLocation()
	const unreadCount = useNotificationStore((state) => state.unreadCount)

	const navItems = [
		{ path: '/feed', icon: Home, label: 'Feed' },
		{ path: '/chat', icon: MessageCircle, label: 'Messages' },
		{ path: '/notifications', icon: Bell, label: 'Notifications' },
		{ path: '/friends', icon: Users, label: 'Friends' },
		{ path: '/profile', icon: User, label: 'Profile' },
	  ];

	return (
		<nav className="fixed inset-x-0 bottom-0 z-50 flex flex-row justify-around items-center py-3 px-4 bg-white dark:bg-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
			{navItems.map((item) => {
				const isActive = location.pathname === item.path
				return (
					<NavLink
						key={item.path}
						to={item.path}
						className={cn(
							"flex flex-col items-center justify-center gap-1 min-w-[3rem] py-2",
							isActive ? "text-[var(--yale-blue-500)]" : "text-gray-500 dark:text-gray-600"
						)}
					>
						<span className="relative">
							<item.icon className="h-6 w-6" />
							{item.path === "/notifications" && unreadCount > 0 ? (
								<span
									className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground"
									aria-hidden
								>
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							) : null}
						</span>
						{isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--yale-blue-500)]" aria-hidden />}
						<span className="sr-only">{item.label}</span>
					</NavLink>
				)
			})}
		</nav>
	)
}
