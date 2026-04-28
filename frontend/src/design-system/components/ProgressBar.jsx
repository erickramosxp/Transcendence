import React, { useState, useEffect } from "react";
import * as Progress from "@radix-ui/react-progress";

export const ProgressBar = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value > displayValue) {
            const diff = value - displayValue;
            const step = diff * 0.15; 
            
            const timeout = setTimeout(() => {
                setDisplayValue(prev => Math.min(prev + step + 0.5, value));
            }, 20);

            return () => clearTimeout(timeout);
        }
    }, [value, displayValue]);

    return (
        <div className="flex flex-col items-center gap-3 pt-5">
            <Progress.Root
                className="relative h-[12px] w-[300px] overflow-hidden rounded-full bg-black/10"
                value={displayValue}
            >
                <Progress.Indicator
                    className="h-full w-full bg-gradient-btn-primary"
                    style={{
                        transition: 'transform 100ms linear',
                        transform: `translateX(-${100 - displayValue}%)`,
                    }}
                />
            </Progress.Root>
            <p className="text-xs font-medium">{Math.round(displayValue)}%</p>
        </div>
    );
};