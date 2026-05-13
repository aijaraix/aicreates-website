import { LogoMark } from "./LogoMark";
import wordmark from "@/assets/aica-wordmark.png";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <LogoMark className="h-5 w-auto shrink-0" />
      <img
        src={wordmark}
        alt="AIcreatesAI"
        draggable={false}
        decoding="async"
        loading="eager"
        className="h-3 w-auto"
      />
    </span>
  );
}
