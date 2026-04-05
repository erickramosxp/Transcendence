import { resolveMediaType } from "@/shared/resolveMediaType";
import { useEffect, useState, useRef } from "react";


export function Media({ url, mimeType }) {
    const [mediaType, setMediaType] = useState(null);

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.3;
        }
    }, [mediaType]);

    useEffect(() => {
        let isMounted = true;

        async function detect() {
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

    // se não tiver URL
    if (!url) return null;

    // loading
    if (!mediaType) {
        return (
            <div className="animate-pulse bg-muted-foreground h-64 w-full rounded-lg" />
        );
    }

    if (mediaType === 'image') {
        return (
            <img
                src={url}
                alt=""
                className="mt-3 max-h-[400px] max-w-full rounded-lg object-contain"
            />
        );
    }

    if (mediaType === 'video') {
        return (
            <video
                controls
                className="rounded-lg lx:max-w-lg mt-3 max-w-xl w-full"
                ref={videoRef}
            >
                <source src={url}type="video/mp4" />
            </video>
        );
    }

    // não renderiza nada
    return null;
}