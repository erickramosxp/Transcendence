import React, { useEffect } from 'react'


export const ImageCropModal = ({ children, onClose }) => {

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50
            flex items-center justify-center p-1 sm:p-4
            bg-back/40
            backdrop-blur-sm" onClick={onClose}>
            <div className="fixed inset-x-1/12 inset-y-1/6 sm:inset-1/6 z-10" onClick={(e) => e.stopPropagation()}>
                {children}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 cursor-pointer"
                >
                    X
                </button>
            </div>
        </div>
    )
}
