import React, { useEffect } from 'react'
import { useSocketStore } from '@/shared/realtime/store/useSocketStore'

const RealtimeProvider = ({ children }) => {
    const connect = useSocketStore((state) => state.connect)
    const disconnect = useSocketStore((state) => state.disconnect)

    useEffect(() => {
        connect()

        return () => {
            disconnect()
        }
    }, [])

    return children
}

export default RealtimeProvider