import React from 'react'

export function BgAnimated() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#6e93c4]/20 to-[#92aed3]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-[#6e93c4]/20 to-[#92aed3]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#92aed3]/10 to-[#6e93c4]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
    )
}
