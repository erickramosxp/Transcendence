import { resolveMediaType } from "@/shared/resolveMediaType";
import { useEffect, useState, useRef } from "react";


function Media({ url, mimeType }) {
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

    // 🚫 Se não tiver URL → não renderiza nada
    if (!url) return null;

    // 🔄 loading
    if (!mediaType) {
        return (
            <div className="animate-pulse bg-gray-300 h-64 w-full rounded-lg" />
        );
    }

    // 🖼 imagem
    if (mediaType === 'image') {
        return (
            <img
                src={url}
                alt=""
                // className="w-full rounded-lg object-cover"
                style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }}
            />
        );
    }

    // 🎥 vídeo
    if (mediaType === 'video') {
        return (
            <video
                src={url}
                controls
                className="w-full rounded-lg"
                style={{ maxWidth: '80%', maxHeight: '400px', marginTop: '10px' }}
                ref={videoRef}
            />
        );
    }

    // ❌ não suportado → não renderiza nada
    return null;
}

export default Media;