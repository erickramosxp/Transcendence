import { Outlet } from 'react-router-dom'
import { LeftSidebar } from './LeftSidebar'

export function PrivateLayout() {

    return (
        <div className="flex">
            <LeftSidebar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}