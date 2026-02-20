import { Outlet } from 'react-router-dom'
import { LeftSidebar } from './LeftSidebar'

export function PrivateLayout() {

    return (
        <div>
            {/* <LeftSidebar /> */}
            <main>
                <Outlet />
            </main>
        </div>
    )
}