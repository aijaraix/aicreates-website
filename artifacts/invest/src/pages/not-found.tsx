import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-[#00F5D4] mb-4">
        404
      </div>
      <h1
        className="text-3xl font-semibold mb-3"
        style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
      >
        Page not found
      </h1>
      <p className="text-white/60 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="brand-cta"
      >
        Back to home
      </Link>
    </div>
  );
}
