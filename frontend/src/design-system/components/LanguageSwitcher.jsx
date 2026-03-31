import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Brazil, Spain, UnitedStates } from "@/design-system/icons";
import { createPortal } from "react-dom";

const languages = [
  { code: "pt", label: "Português", flag: "🇧🇷", icon: <Brazil /> },
  { code: "en", label: "English", flag: "🇺🇸", icon: <UnitedStates /> },
  { code: "es", label: "Español", flag: "🇪🇸", icon: <Spain /> },
];

export function LanguageSwitcher() {

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState(null);
  const { changeLanguage, currentLanguage } = useLanguage();


  const current = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const dropdownWidth = 160; // ou estimativa
      const padding = 8;

      let left = rect.left + window.scrollX;

      // 👉 se ultrapassar a direita da tela
      if (left + dropdownWidth > window.innerWidth) {
        left = rect.right - dropdownWidth;
      }

      // 👉 se ultrapassar a esquerda
      if (left < padding) {
        left = padding;
      }

      setPosition({
        top: rect.bottom + window.scrollY,
        left,
      });
    }
  }, [isOpen]);

  function handleSelectLanguage(code) {
    setIsOpen(false);

    changeLanguage(code);
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
        className="relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Idioma atual: ${current.label}`}
        title={current.label}
        ref={buttonRef}
      >
        <Languages className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 text-xs leading-none">
          {current.flag}
        </span>
        <span className="absolute -bottom-1 -right-1 text-xs leading-none">
          {current.icon}
        </span>
      </Button>

      {isOpen && position && createPortal(
        <div style={{
          position: "absolute",
          top: position.top,
          left: position.left,
        }}
          className="z-80 min-w-[140px] rounded-md border bg-background p-1 shadow-md">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
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
