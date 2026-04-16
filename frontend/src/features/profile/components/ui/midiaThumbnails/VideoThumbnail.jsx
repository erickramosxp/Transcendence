import { useEffect, useState } from "react";
import { generateVideoThumbnailFromUrl } from "@/features/profile/utils/generateVideoThumbnail";
import { Loading } from "@/design-system";
import { Play } from 'lucide-react'


export const VideoThumbnail = ({ thumbnailUrl }) => {

    const [thumbnail, setThumbnail] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {

        const getThumbnail = async () => {

            try {
                const image = await generateVideoThumbnailFromUrl(thumbnailUrl);

                if (!image) {
                    setThumbnail("https://t4.ftcdn.net/jpg/05/24/04/51/360_F_524045110_UXnCx4GEDapddDi5tdlY96s4g0MxHRvt.jpg")
                    setError(true);
                    return;
                }
                const imageUrl = URL.createObjectURL(image);
                setThumbnail(imageUrl);
            } catch (err) {
                setThumbnail("https://t4.ftcdn.net/jpg/05/24/04/51/360_F_524045110_UXnCx4GEDapddDi5tdlY96s4g0MxHRvt.jpg")
                setError(true);
                console.log(err);
            }
        }

        getThumbnail();
    }, [thumbnailUrl]);


    if (thumbnail == null) {
        return (
            <Loading size="sm" />
        );
    }

    return (
        <div className="relative w-full h-full cursor-pointer group">

            <img
                src={thumbnail}
                alt="video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.src = `${error}`;
                }}
            />

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

            {!error &&
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 sm:size-15 rounded-full bg-black/40 flex items-center justify-center">
                        <Play />
                    </div>
                </div>
            }
        </div>
    );
}