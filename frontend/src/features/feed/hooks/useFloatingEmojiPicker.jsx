import { useLayoutEffect, useRef, useState } from "react";

export function useFloatingEmojiPicker(open) {
    const anchorRef = useRef(null);
    const [pickerStyle, setPickerStyle] = useState({
        top: 0,
        left: 0,
    });

    useLayoutEffect(() => {
        if (!open || !anchorRef.current) return;

        const updatePosition = () => {
            const rect = anchorRef.current.getBoundingClientRect();

            setPickerStyle({
                top: rect.bottom,
                left: rect.left,
            });
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open]);

    return { anchorRef, pickerStyle };
}