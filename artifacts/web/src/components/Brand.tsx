import { LogoMark } from "./LogoMark";

export function Brand() {
  return (
    <span
      className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
      style={{ fontFamily: "var(--app-font-wordmark)" }}
    >
      <LogoMark className="h-5 w-auto shrink-0" />
      <span>
        <span className="text-[#00F5D4]">AI</span>
        <span className="font-normal">creates</span>
        <span className="text-[#00F5D4]">AI</span>
      </span>
    </span>
  );
}
