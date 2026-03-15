import { Outlet } from 'react-router-dom'

import { LeftSidebar } from '@/app/layouts/LeftSidebar'
import { BottomSidebar } from '@/app/layouts/BottomSidebar'

export function PrivateLayout() {

    return (
        <div className="flex">
            <LeftSidebar />
            <main className="flex-1 pb-20 lg:pb-0">
                <Outlet />
            </main>
            <div className="lg:hidden">
                <BottomSidebar />
            </div>
        </div>
    )
}
