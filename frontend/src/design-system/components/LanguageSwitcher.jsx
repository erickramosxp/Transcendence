import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
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

const DROPDOWN_WIDTH = 160;
const VIEWPORT_PADDING = 8;
const GAP = 6;
const MENU_ROW_EST = 40;

function computeMenuPosition(buttonEl, menuHeight) {
  const rect = buttonEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  const spaceBelow = vh - rect.bottom - VIEWPORT_PADDING;

  const openDown = spaceBelow >= spaceAbove;

  let top;
  let maxHeight;

  if (openDown) {
    top = rect.bottom + GAP;
    const roomBelow = vh - VIEWPORT_PADDING - top;
    if (roomBelow < menuHeight) {
      maxHeight = Math.max(roomBelow, 72);
    }
  } else {
    top = rect.top - GAP - menuHeight;
    if (top < VIEWPORT_PADDING) {
      maxHeight = Math.max(rect.top - GAP - VIEWPORT_PADDING, 72);
      top = VIEWPORT_PADDING;
    }
  }

  let left = rect.left;
  if (left + DROPDOWN_WIDTH > vw - VIEWPORT_PADDING) {
    left = Math.max(VIEWPORT_PADDING, rect.right - DROPDOWN_WIDTH);
  }
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  return { left, top, maxHeight };
}


export function LanguageSwitcher({activeToastNotification = false}) {

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState(null);
  const { changeLanguage, currentLanguage } = useLanguage();


  const current = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setPosition(null);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const measureAndSet = () => {
      const estimated = languages.length * MENU_ROW_EST + 8;
      const measured = dropdownRef.current?.offsetHeight;
      const menuHeight =
        measured && measured > 0 ? measured : estimated;
      setPosition(computeMenuPosition(buttonEl, menuHeight));
    };

    measureAndSet();
    const rafIds = { outer: 0, inner: 0 };
    rafIds.outer = requestAnimationFrame(() => {
      rafIds.inner = requestAnimationFrame(measureAndSet);
    });

    window.addEventListener("resize", measureAndSet);
    document.addEventListener("scroll", measureAndSet, true);

    return () => {
      cancelAnimationFrame(rafIds.outer);
      cancelAnimationFrame(rafIds.inner);
      window.removeEventListener("resize", measureAndSet);
      document.removeEventListener("scroll", measureAndSet, true);
    };
  }, [isOpen]);

  function handleSelectLanguage(code) {
    closeMenu();
    changeLanguage(code);
    if (activeToastNotification)
      toast.success(i18n.t('common:language.changed'));
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground",
          "transition-colors",
        )}
        onClick={() => {
          if (isOpen) closeMenu();
          else setIsOpen(true);
        }}
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
            top: position.top,
            ...(position.maxHeight != null
              ? { maxHeight: position.maxHeight, overflowY: "auto" }
              : {}),
          }}
          ref={dropdownRef}
          className="z-[100] min-w-[140px] rounded-md border bg-background p-1 shadow-md"
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
