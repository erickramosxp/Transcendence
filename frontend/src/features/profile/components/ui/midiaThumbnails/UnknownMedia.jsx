import React from "react";
import { FileQuestionMark } from 'lucide-react'


export function UnknownMedia() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-primary/40">
            <FileQuestionMark className="size-8 sm:size-12" />
        </div>
    );
}