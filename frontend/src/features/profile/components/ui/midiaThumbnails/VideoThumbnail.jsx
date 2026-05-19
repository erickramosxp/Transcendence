import { useState } from "react";
import { Play } from "lucide-react";
import { Loading } from "@/design-system";

export const VideoThumbnail = ({ thumbnailUrl }) => {

    const [loaded, setLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const showPlaceholder = !thumbnailUrl || imageError;

    if (showPlaceholder) {
        return (
            <div className="bg-primary/40 w-full h-full flex items-center justify-center">
                <Play className="size-8 sm:size-12 fill-current" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden group">

            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loading size="sm" />
                </div>
            )}

            <img
                src={thumbnailUrl}
                alt="video thumbnail"
                className="w-full h-full object-cover"
                onLoad={() => setLoaded(true)}
                onError={() => setImageError(true)}
            />

            {loaded && (
                <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-12 rounded-full bg-black/40 flex items-center justify-center">
                            <Play className="size-5 text-white fill-white" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};