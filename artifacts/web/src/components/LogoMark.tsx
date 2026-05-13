type Props = {
  className?: string;
  title?: string;
};

export function LogoMark({ className = "h-6 w-auto", title }: Props) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="aica-logo-face" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#A1A1AA" />
        </linearGradient>
        <linearGradient id="aica-logo-bar" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1AFFE0" />
          <stop offset="1" stopColor="#00F5D4" />
        </linearGradient>
      </defs>
      <path
        d="M3.4 24 L13.2 4.2 L19.6 24"
        stroke="url(#aica-logo-face)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="22.6"
        y="4.2"
        width="3.2"
        height="19.6"
        rx="1.4"
        fill="url(#aica-logo-bar)"
      />
    </svg>
  );
}
