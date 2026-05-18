import React from 'react';

export function MediaSkeleton({ width, height, blurUrl, className = "" }) {

    // Se vier vazio do banco, usa números proporcionais a 16:9 (sempre sem 'px' ou '%')
    const w = width || 1600;
    const h = height || 900;

    return (
        <div

            className={`relative overflow-hidden flex-shrink-0 w-fit h-fit ${className}`}
            aria-hidden="true"
        >
            <svg
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                className="block w-auto h-auto max-w-full max-h-[400px] opacity-0 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
            />

            <div className="absolute inset-0 w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse">
                {blurUrl && (
                    <img
                        src={blurUrl}
                        alt=""
                        className="w-full h-full object-cover scale-110 blur-md opacity-70"
                    />
                )}
            </div>
        </div>
    );
}