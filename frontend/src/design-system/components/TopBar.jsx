import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/design-system/tokens/colors";

export function TopBar({ className }) {
  return (
    <div className={cn(
      "fixed top-4 right-4 sm:top-6 sm:right-6 z-[50]",
      className
    )}>
      <div className="
        bg-card/95 backdrop-blur-xl
        rounded-md p-1.5
        shadow-lg border border-border
        flex items-center gap-1
      ">
        <ThemeToggle compact={true} />
        <div className="w-px h-6 bg-border" />
        <LanguageSwitcher compact={true} />
      </div>
    </div>
  );
}
