import React, { useEffect, useState } from 'react'
import { Avatar } from "@/design-system";
import { FileUploadButton } from '@/design-system';
import { cn } from '@/design-system/tokens/colors';

/**
 * Avatar com botão de upload (`fileKind="avatar"`, limite `LIMITS.avatarFileMB`).
 * `onChange` recebe o arquivo já validado pelo FileUploadButton; ProfileHeader revalida antes do crop.
 */
export const AvatarEditable = ({ user, canEdit = false, onChange }) => {

    const [showHint, setShowHint] = useState(true);


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="-mt-16 rounded-full p-1 relative z-5 border-background bg-background">
            <div className="relative group">
                <Avatar
                    size="xl3"
                    id={user?.username}
                    name={user?.name}
                    src={user?.avatarUrl}
                    className={canEdit ? "group-hover:brightness-75" : ""}
                />

                {canEdit && (
                    <label className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "transition-opacity duration-1000",
                        showHint
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                    )}
                    >

                        <FileUploadButton
                            onFileSelect={onChange}
                            className="text-accent-foreground text-xs font-bold bg-accent/60 px-2 py-1 rounded cursor-pointer"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            fileKind="avatar"
                        />
                    </label>
                )}
            </div>
        </div>
    )
}