import { resolveMediaType } from "@/shared/resolveMediaType";
import { useEffect, useState, useRef } from "react";


export function Media({ url, mimeType }) {
    const [mediaType, setMediaType] = useState(null);
    const [mediaLoaded, setMediaLoaded] = useState(false);

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.3;
        }
    }, [mediaType]);

    useEffect(() => {
        let isMounted = true;

        async function detect() {
            setMediaLoaded(false);

            const type = await resolveMediaType(url, mimeType);

            if (isMounted) {
                setMediaType(type);
            }
        }

        if (url) detect();

        return () => {
            isMounted = false;
        };
    }, [url, mimeType]);

    if (!url) return null;

    return (
        <div className="relative mt-3 rounded-lg overflow-hidden">

            {/* skeleton fica no fundo */}
            <div
                className={`
                absolute inset-0
                bg-muted
                animate-pulse
                transition-opacity duration-500 ease-out
                ${mediaLoaded ? "opacity-0" : "opacity-100"}
            `}
            />

            {/* mídia entra por cima */}
            {mediaType === "image" && (
                <img
                    src={url}
                    alt=""
                    onLoad={() => setMediaLoaded(true)}
                    className={`
                    relative z-10
                    w-full
                    max-h-[400px]
                    object-contain
                    transition-opacity duration-500 ease-out
                    ${mediaLoaded ? "opacity-100" : "opacity-0"}
                `}
                />
            )}

            {mediaType === "video" && (
                <video
                    preload="metadata"
                    controls
                    ref={videoRef}
                    onLoadedData={() => setMediaLoaded(true)}
                    className={`
                    relative z-10
                    w-full
                    max-h-[400px]
                    object-contain
                    transition-opacity duration-500 ease-out
                    ${mediaLoaded ? "opacity-100" : "opacity-0"}
                `}
                >
                    <source src={url} type="video/mp4" />
                </video>
            )}
        </div>
    );
}