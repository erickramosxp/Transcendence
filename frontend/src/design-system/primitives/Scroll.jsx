import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "../tokens/colors";

export function Scroll({ children, className, ...props }) {
  return (
    <ScrollArea.Root
      className="w-full overflow-hidden"
      {...props}
    >
      <ScrollArea.Viewport
        className={cn("min-h-[80px] max-h-[250px]", className)}
      >
        {children}
      </ScrollArea.Viewport>

      <ScrollArea.Scrollbar
        orientation="vertical"
        className="invisible flex w-0 select-none touch-none p-0.5 opacity-0 bg-transparent data-[state=hidden]:invisible data-[state=hidden]:opacity-0"
      >
        <ScrollArea.Thumb className="flex-1 rounded-full bg-transparent data-[state=hidden]:hidden" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export default Scroll;