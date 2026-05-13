import { LogoMark } from "./LogoMark";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-2 font-sans font-semibold tracking-tight whitespace-nowrap">
      <LogoMark className="h-5 w-auto shrink-0" />
      <span>
        <span className="text-[#00F5D4]">AI</span>
        <span className="font-light">creates</span>
        <span className="text-[#00F5D4]">AI</span>
      </span>
    </span>
  );
}
