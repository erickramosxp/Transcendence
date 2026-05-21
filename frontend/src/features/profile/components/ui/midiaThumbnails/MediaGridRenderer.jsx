import React from 'react'
import { VideoThumbnail } from './VideoThumbnail';
import { AudioThumbnail } from './AudioThumbnail';
import { UnknownMedia } from './UnknownMedia';

export const MediaGridRenderer = ({ item }) => {

    const { mediaUrl, mediaType, width, height, blurUrl } = item || {};

    if (mediaType === "IMAGE") {
        return (
            <img
                src={mediaUrl}
                className="w-full h-full object-cover"
            />
        );
    }

    if (mediaType === "VIDEO") {
        return (
            <VideoThumbnail thumbnailUrl={mediaUrl} />
        );
    }

    if (mediaType === "AUDIO") {
        return <AudioThumbnail />;
    }

    return <UnknownMedia />;
}
