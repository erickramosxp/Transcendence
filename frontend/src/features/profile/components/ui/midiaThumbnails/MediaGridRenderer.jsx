import React from 'react'
import { VideoThumbnail } from './VideoThumbnail';
import { AudioThumbnail } from './AudioThumbnail';
import { UnknownMedia } from './UnknownMedia';
import { resolveMediaTypeSync } from '@/shared/resolveMediaType';

export const MediaGridRenderer = ({ item }) => {
    
    const type = resolveMediaTypeSync(item?.mediaUrl);

    if (type === "image") {
        return (
            <img
                src={item.mediaUrl}
                className="w-full h-full object-cover"
            />
        );
    }

    if (type === "video") {
        return (
            <VideoThumbnail thumbnailUrl={item.mediaUrl} />
        );
    }

    if (type === "audio") {
        return <AudioThumbnail />;
    }

    return <UnknownMedia />;
}
