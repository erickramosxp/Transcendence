import React from 'react';

export function MediaSkeleton({
    width = "100%",
    height = "400px",
    className = ""
}) {


    return (
        <div
            // style={{ width, height }}
            className={`
                rounded-lg
                bg-muted
                w-full
                aspect-video
                animate-pulse
                transition-opacity duration-500 ease-out
                ${className}
            `}
            aria-hidden="true"
        />
    );
}