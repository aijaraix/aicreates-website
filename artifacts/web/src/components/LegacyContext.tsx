import { Link } from "wouter";

export function LegacyContext() {
  return (
    <aside
      aria-label="Earlier materials"
      className="container mx-auto mt-28 px-4 md:px-6"
    >
      <div className="rounded-2xl border border-amber-200/25 bg-amber-200/5 p-5 text-sm leading-relaxed text-white/75">
        <p className="mb-2 font-semibold text-amber-100">Earlier materials</p>
        <p>
          This page describes earlier plans and is retained for reference. See{" "}
          <Link
            href="/eve-cxo"
            className="underline underline-offset-4 text-white"
          >
            EVE CXO
          </Link>{" "}
          for the current product direction, or{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 text-white"
          >
            contact the company
          </Link>{" "}
          about specific records. Existing investor records and agreements have
          not been changed by this website update.
        </p>
      </div>
    </aside>
  );
}
