import React from "react";
import { AudioLines } from 'lucide-react'



export function AudioThumbnail() {
    
    return (
        <div className="bg-primary/40 w-full h-full flex items-center justify-center">
            <AudioLines className="size-8 sm:size-12" />
        </div>
    );
}