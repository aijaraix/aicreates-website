import logoMark from "@/assets/aica-logo-mark.png";

type Props = {
  className?: string;
  alt?: string;
};

export function LogoMark({ className = "h-6 w-auto", alt = "AI Creates AI" }: Props) {
  return (
    <img
      src={logoMark}
      alt={alt}
      draggable={false}
      className={className}
      decoding="async"
      loading="eager"
    />
  );
}
