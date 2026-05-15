import { resolveMediaType } from "@/shared/resolveMediaType";
import { useEffect, useState, useRef } from "react";
import { MediaSkeleton } from "@/design-system";


export function Media({ url, mimeType }) {
    const [mediaType, setMediaType] = useState(null);
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const videoRef = useRef(null);

    const mediaStyles = `
        mt-3 rounded-lg
        transition-opacity duration-500 ease-out
        ${mediaLoaded ? "opacity-100 block" : "opacity-0 hidden"}
    `;

    useEffect(() => {
        if (videoRef.current && mediaType === "video") {
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
        <>

            {!mediaLoaded && (
                <MediaSkeleton  />
            )}

            {mediaType === "image" && (
                <img
                    src={url}
                    alt=""
                    onLoad={() => setMediaLoaded(true)}
                    className={`${mediaStyles} max-h-100 max-w-full object-contain`}
                />
            )}

            {mediaType === "video" && (
                <video
                    preload="metadata"
                    controls
                    ref={videoRef}
                    onLoadedData={() => setMediaLoaded(true)}
                    className={`${mediaStyles} lx:max-w-lg max-w-xl w-full sm:max-h-100`}
                >
                    <source src={url} type="video/mp4" />
                </video>
            )}
        </>
    );
}