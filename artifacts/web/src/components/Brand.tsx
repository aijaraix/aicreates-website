import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  variant?: "inline" | "wordmark";
}

/**
 * Renders the AIcreatesAI brand name with the "AI" portions visually
 * distinguished from "creates", so the wordmark reads unambiguously
 * even in fonts where capital-I and lowercase-l look alike.
 *
 * - inline: subtle accent on AI, sized to inherit (use within paragraphs)
 * - wordmark: bolder display treatment for nav/footer/hero
 */
export function Brand({ className, variant = "inline" }: BrandProps) {
  if (variant === "wordmark") {
    return (
      <span className={cn("font-sans font-extrabold tracking-tight", className)}>
        <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">
          AI
        </span>
        <span className="font-medium">creates</span>
        <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">
          AI
        </span>
      </span>
    );
  }
  return (
    <span className={cn("font-semibold whitespace-nowrap", className)}>
      <span className="text-violet-300">AI</span>
      <span>creates</span>
      <span className="text-violet-300">AI</span>
    </span>
  );
}
