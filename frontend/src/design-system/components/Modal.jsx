import React, { useEffect } from 'react'
import { Button } from '@/design-system/primitives/Button';

export function Modal({open, title, onClose, children, size = "md" }) {

    const sizes = {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md sm:max-w-lg",
        lg: "w-full max-w-lg sm:max-w-xl",
        xl: "w-full max-w-xl sm:max-w-2xl",
    };

    useEffect(() => {

        if (!open)
            return;

        const onKeyDown = (e) => {
            if (e.key === "Escape")
                onClose?.();
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        }

    }, [open, onClose]);


    if (!open)
        return null;

    return (
        <div
            className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40
            backdrop-blur-sm
            "
            onMouseDown={(e) => {
                if (e.target === e.currentTarget)
                        onClose?.();
            }}>
            <div 
                className={`${sizes[size]}
                    w-full max-w-sm sm:max-w-lg
                    bg-card text-foreground
                    rounded-xl border border-border
                    shadow-2xl
                    `}
                role='dialog'
                aria-modal='true'>
                <div className="flex items-center justify-between px-4 py-3">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <Button variant='destructive' className='cursor-pointer' onClick={onClose} aria-label='Fechar'>
                        x
                    </Button>
                </div>

                <div className="px-4 py-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
