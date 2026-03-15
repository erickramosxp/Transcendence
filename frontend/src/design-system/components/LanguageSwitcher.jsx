import { Button } from "@/design-system/primitives/Button"
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <Languages className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 text-xs">🇧🇷</span>
      <span className="absolute -top-1 -right-1 text-xs">🇬🇧</span>
    </Button>
  );
}
