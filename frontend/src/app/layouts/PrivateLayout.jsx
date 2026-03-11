import { Outlet } from 'react-router-dom'
import { LeftSidebar } from './LeftSidebar'
import { BottomSidebar } from './BottomSidebar'

export function PrivateLayout() {

    return (
        <div className="flex">
            <LeftSidebar />
            <main className="flex-1 pb-20">
                <Outlet />
            </main>
            <div className="lg:hidden">
                <BottomSidebar />
            </div>
        </div>
    )
}
