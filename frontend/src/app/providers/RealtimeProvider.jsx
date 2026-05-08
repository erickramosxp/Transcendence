import React, { useEffect } from 'react'
import { useSocketStore } from '@/shared/realtime/store/useSocketStore'

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
        connect()

        return () => {
            disconnect()
        }
    }, [])

    return children
}

export default RealtimeProvider