import * as ScrollArea from "@radix-ui/react-scroll-area";

export function Scroll({ children, className }) {

    return (
        <ScrollArea.Root className="w-full overflow-hidden">
            <ScrollArea.Viewport className="min-h-[80px] max-h-[250px]">
                {children}
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
                orientation="vertical"
                className="flex select-none touch-none p-0.5 bg-slate-200 dark:bg-slate-800"
            >
                <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-full" />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}

export default Scroll;
