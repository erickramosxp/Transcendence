

import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { createPortal } from "react-dom";
import { toast } from 'react-toastify';
import { Button } from "@/design-system"
import { Brazil, Spain, UnitedStates } from "@/design-system/icons"
import { cn } from "@/design-system/tokens/colors"
import i18n from "@/i18n";

const languages = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷", icon: <Brazil /> },
  { code: "en-US", label: "English", flag: "🇺🇸", icon: <UnitedStates /> },
  { code: "es-ES", label: "Español", flag: "🇪🇸", icon: <Spain /> },
];


export function LanguageSwitcher({activeToastNotification = false}) {

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState(null);
  const { changeLanguage, currentLanguage } = useLanguage();


  const current = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const dropdownWidth = 160;
      const padding = 8;
      const gap = 6;

      let left = rect.left;

      if (left + dropdownWidth > window.innerWidth - padding) {
        left = Math.max(padding, rect.right - dropdownWidth);
      }

      if (left < padding) {
        left = padding;
      }

      /* Abre para cima: borda inferior do menu fica acima do botão (viewport + fixed). */
      setPosition({
        left,
        bottom: window.innerHeight - rect.top + gap,
      });
    }
  }, [isOpen]);

  function handleSelectLanguage(code) {
    setIsOpen(false);
    changeLanguage(code);
    if (activeToastNotification)
      toast.success(i18n.t('common:language.changed'));
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground",
          "transition-colors",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Idioma atual: ${current.label}`}
        title={current.label}
        ref={buttonRef}
      >
        <Languages className="h-5 w-5" />
        <span className="ds-emoji-flag absolute -top-1 -right-1 text-xs">
          {current.flag}
        </span>
        <span className="absolute -bottom-1 -right-1 text-xs leading-none">
          {current.icon}
        </span>
      </Button>

      {isOpen && position && createPortal(
        <div
          style={{
            position: "fixed",
            left: position.left,
            bottom: position.bottom,
          }}
          ref={dropdownRef}
          className="z-80 min-w-[140px] rounded-md border bg-background p-1 shadow-md"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span className="ds-emoji-flag">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>

              {currentLanguage === lang.code && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
