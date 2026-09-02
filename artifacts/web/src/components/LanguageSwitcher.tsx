import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LANGUAGES } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full glass-btn text-white/80 hover:text-white transition focus:outline-none ${
            compact ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm"
          }`}
          data-testid="button-language-switcher"
          aria-label="Select language"
        >
          <span aria-hidden className="text-base leading-none">{current.flag}</span>
          <span className="hidden sm:inline font-medium">{current.label}</span>
          <span className="sm:hidden font-medium uppercase">{current.code}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[200px] bg-[#0E0E0E]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/40 flex items-center gap-1.5">
          <Globe className="w-3 h-3" /> Language
        </div>
        {LANGUAGES.map((l) => {
          const active = l.code === current.code;
          return (
            <DropdownMenuItem
              key={l.code}
              onClick={() => void i18n.changeLanguage(l.code)}
              className={`rounded-lg cursor-pointer focus:bg-white/[0.06] focus:text-white px-3 py-2 flex items-center gap-2 ${
                active ? "text-white bg-white/[0.04]" : "text-white/80"
              }`}
              data-testid={`language-option-${l.code}`}
            >
              <span aria-hidden className="text-base leading-none">{l.flag}</span>
              <span className="text-sm font-medium flex-1">{l.label}</span>
              {active && <Check className="w-3.5 h-3.5 text-[#00F5D4]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
