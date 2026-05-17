import React, { useEffect, useState } from 'react'
import { Card, CardTitle, CardContent, CardHeader, Media, Avatar, LikeButton, TextWithLink, Separator } from '@/design-system';
import { MessageSquare } from "lucide-react";
import { cn } from '@/design-system/tokens/colors';
import { useTranslation } from 'react-i18next';

export const PostPreview = ({ content, file, user }) => {

    const [previewUrl, setPreviewUrl] = useState(null);
    const { t } = useTranslation('feed'); 

    if (!content?.trim() && !file) return null;

    useEffect(() => {

        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [file]);

    return (
        <Card className='px-2 w-full'>
            <CardHeader>
                <CardTitle>
                    {t('preview.title')}
                </CardTitle>
                <Separator />
            </CardHeader>
            <CardContent className='px-1 '>
                <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div>
                        <Avatar
                            src={user?.avatarUrl}
                            name={user?.name}
                            username={user?.username}
                            size="md"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="truncate">
                                    {user?.name}
                                </span>

                                <span className="text-muted-foreground">
                                    @{user?.username}
                                </span>

                                <span className="text-muted-foreground">
                                    {t('preview.time')}
                                </span>
                            </div>

                            {content?.trim() && (
                                <div className="mt-2 min-w-0 overflow-hidden break-words leading-relaxed text-foreground [overflow-wrap:anywhere]">
                                    <TextWithLink text={content} />
                                </div>
                            )}

                            {previewUrl && (
                                <Media
                                    url={previewUrl}
                                    mimeType={file?.type}
                                />
                            )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground sm:gap-6">
                            <LikeButton
                                onClick={() => { }}
                                liked={false}
                                count={0}
                            />
                            <button
                                onClick={() => {}}
                                className={cn(
                                    "flex items-center gap-2 text-sm transition-all hover:scale-105",
                                    "text-muted-foreground hover:text-primary"
                                )}
                            >
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-medium">
                                    0
                                </span>
                            </button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
