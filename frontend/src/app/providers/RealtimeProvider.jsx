import React, { useEffect } from 'react'
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore'
import { useSocketStore } from '@/shared/realtime/store/useSocketStore'
import { PROFILE_AUTHOR_NAME_UPDATED } from '@/shared/profile/profileAuthorSync'

const RealtimeProvider = ({ children }) => {
    const connect = useSocketStore((state) => state.connect)
    const disconnect = useSocketStore((state) => state.disconnect)

    useEffect(() => {
        const syncNavigator = () => {
            useSocketStore.setState({
                navigatorOnline:
                    typeof navigator !== 'undefined' ? navigator.onLine : true,
            })
        }
        syncNavigator()
        window.addEventListener('online', syncNavigator)
        window.addEventListener('offline', syncNavigator)
        return () => {
            window.removeEventListener('online', syncNavigator)
            window.removeEventListener('offline', syncNavigator)
        }
    }, [])

    useEffect(() => {
        void useNotificationStore.getState().refreshUnreadCount()
        connect()

        return () => {
            disconnect()
        }
    }, [])

    useEffect(() => {
        const onAuthorNameUpdated = (event) => {
            const { username, name } = event.detail ?? {}
            if (!username || !name) return
            useNotificationStore.getState().applyAuthorNameUpdate(username, name)
        }

        window.addEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated)
        return () => {
            window.removeEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated)
        }
    }, [])

    return children
}

export default RealtimeProvider