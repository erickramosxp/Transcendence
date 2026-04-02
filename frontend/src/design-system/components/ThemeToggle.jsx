import { Moon, Sun } from 'lucide-react';
import { Button } from '@/design-system';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle({ variant = "ghost", compact = false }) {
  
  const {isDark, toggleTheme} = useTheme();

  // Compact version (icon only)
  if (compact) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </Button>
    );
  }

  // Full version - just icon button (no toggle switch)
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      )}
    </Button>
  );
}
