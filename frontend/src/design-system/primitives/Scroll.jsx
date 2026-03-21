import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "../tokens/colors";

export function Scroll({ children, className, ...props }) {

    return (
        <ScrollArea.Root className="w-full overflow-hidden">
            <ScrollArea.Viewport className={cn("min-h-[80px] max-h-[250px]", className)}>
                {children}
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
                orientation="vertical"
                className="flex select-none touch-none p-0.5 bg-slate-200 dark:bg-slate-800 data-[state=hidden] opacity-0 invisible w-0"
            >
                <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-full data-[state=hidden]" />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}

export default Scroll;
