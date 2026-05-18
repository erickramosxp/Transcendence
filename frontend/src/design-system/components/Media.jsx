import { useEffect, useState, useRef } from "react";
import { MediaSkeleton } from "@/design-system";

export function Media({ media }) {
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const videoRef = useRef(null);

    const { mediaUrl, mediaType, width, height, blurUrl } = media || {};

    const sharedStyles = "col-start-1 row-start-1 w-auto h-auto max-w-full max-h-[400px] rounded-lg";

    useEffect(() => {
        if (videoRef.current && mediaType === "VIDEO") {
            videoRef.current.volume = 0.3;
        }
    }, [mediaType]);

    if (!mediaUrl) return null;

    return (
        <div className="mt-3 w-full max-w-[600px] grid place-items-start">

            {!mediaLoaded && (
                <MediaSkeleton
                    blurUrl={blurUrl}
                    width={width}
                    height={height}
                    className={sharedStyles}
                />
            )}

            {mediaType === "IMAGE" && (
                <img
                    src={mediaUrl}
                    alt=""
                    onLoad={() => setMediaLoaded(true)}
                    className={`${sharedStyles} object-contain transition-opacity duration-500 ease-out ${mediaLoaded ? "opacity-100" : "opacity-0"}`}
                />
            )}

            {mediaType === "VIDEO" && (
                <video
                    preload="metadata"
                    controls
                    ref={videoRef}
                    onLoadedData={() => setMediaLoaded(true)}
                    className={`${sharedStyles} object-contain transition-opacity duration-500 ease-out ${mediaLoaded ? "opacity-100" : "opacity-0"}`}
                >
                    <source src={mediaUrl} type="video/mp4" />
                </video>
            )}
        </div>
    );
}