import { Outlet } from 'react-router-dom'

import { LeftSidebar } from '@/app/layouts/LeftSidebar'
import { BottomSidebar } from '@/app/layouts/BottomSidebar'
import RealtimeProvider from '../providers/RealtimeProvider'

export function PrivateLayout() {

    return (
        <RealtimeProvider>
            <div className="flex h-dvh">
                <LeftSidebar />
                <main className="relative flex-1 pb-20 lg:pb-0 h-full overflow-y-auto">
                    <Outlet />
                </main>
                <div className="lg:hidden">
                    <BottomSidebar />
                </div>
            </div>
        </RealtimeProvider>
    )
}
