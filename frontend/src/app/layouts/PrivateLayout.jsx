import { Outlet } from 'react-router-dom'
import { LeftSidebar } from '@/app/layouts/LeftSidebar'

export function PrivateLayout() {

    return (
        <div>
            <LeftSidebar />
            <main>
                <Outlet />
            </main>
        </div>
    )
}