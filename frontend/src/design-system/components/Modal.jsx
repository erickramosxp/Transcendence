import React, { useEffect } from 'react'
import "@/styles/modal.css"

export function Modal({open, title, onClose, children}) {

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
        <div className='modal-overlay'
            onMouseDown={(e) => {
                if (e.target === e.currentTarget)
                        onClose?.();
            }}>
            <div className='modal-card' role='dialog' aria-modal='true'>
                <div className='modal-header'>
                    <h2>{title}</h2>
                    <button className='modal-close' onClick={onClose} aria-label='Fechar'>
                        x
                    </button>
                </div>

                <div className='modal-body'>
                    {children}
                </div>
            </div>
        </div>
    )
}
