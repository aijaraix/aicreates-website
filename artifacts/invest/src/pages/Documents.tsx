import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { FileText, Download, Lock } from "lucide-react";

interface MeResponse {
  user: { role: string };
}

interface Allocation {
  id: string;
  displayName: string;
  saftSignedAt: string | null;
}

const STATIC_DOCS = [
  {
    title: "Whitepaper",
    blurb:
      "Long-form positioning of the agentic intelligence layer, hybrid compute fabric, Eve OS, tokenomics, and roadmap. Includes a downloadable PDF.",
    href: "https://www.aicreates.ai/litepaper",
    cta: "Open the whitepaper",
    external: true,
  },
  {
    title: "Investor overview",
    blurb:
      "The public investor page on aicreates.ai - $50M raise, $3.5M GPU cluster, why-invest pillars, and the materials index.",
    href: "https://www.aicreates.ai/invest",
    cta: "View on aicreates.ai",
    external: true,
  },
  {
    title: "Round terms summary",
    blurb:
      "All five SAFT rounds - Strategic Seed through Community / Launchpad - with pricing, tokens, raise, FDV, and per-round vesting. Toggle the dashboard schedule to the Vesting view for full details.",
    href: "/dashboard",
    cta: "Open dashboard",
    internal: true,
  },
  {
    title: "Sample SAFT",
    blurb:
      "Reference overview of the AIcreatesAI SAFT - identity, accreditation, payment terms, risk, and wallet mapping. Your signed copy is generated when you complete the SAFT flow.",
    href: "/faq#saft",
    cta: "Read SAFT overview",
    internal: true,
  },
  {
    title: "One-pager (coming soon)",
    blurb:
      "Single-page round summary - terms, raise, use of proceeds, and team. Sharable with co-investors.",
    cta: "Coming soon",
    disabled: true,
  },
  {
    title: "Pitch deck (coming soon)",
    blurb:
      "Investor deck covering market, product, GPU cluster plan, and model. Available shortly after counsel review.",
    cta: "Coming soon",
    disabled: true,
  },
  {
    title: "Risk factors",
    blurb:
      "Standard early-stage and token-specific risk disclosures, mirrored from the SAFT acknowledgments.",
    href: "/faq#risk",
    cta: "Read risk factors",
    internal: true,
  },
];

export default function Documents() {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const allocs = useQuery({
    queryKey: ["me", "allocations"],
    queryFn: () => api<{ allocations: Allocation[] }>("/me/allocations"),
  });
  const isAdmin = me.data?.user.role === "admin";
  const signed = (allocs.data?.allocations ?? []).filter(
    (a) => a.saftSignedAt,
  );

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="Resources"
        title={<>Documents.</>}
        subtitle="Everything you need to evaluate, sign, and fund your AICA SAFT commitment - across all five private-sale rounds - plus your signed SAFTs."
      />
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            Round materials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATIC_DOCS.map((d) => (
              <div
                key={d.title}
                className="brand-card brand-hairline-teal p-6 flex flex-col"
                data-testid={`doc-card-${d.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-2 text-[#00F5D4]">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-[0.14em]">
                    Document
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm text-white/60 flex-1">{d.blurb}</p>
                {d.disabled ? (
                  <button
                    disabled
                    className="mt-5 inline-flex items-center justify-center h-10 px-4 rounded-full border border-white/10 text-white/40 text-sm cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 mr-2" /> {d.cta}
                  </button>
                ) : d.internal ? (
                  <Link href={d.href!} className="brand-cta-outline mt-5">
                    {d.cta}
                  </Link>
                ) : (
                  <a
                    href={d.href}
                    target={d.external ? "_blank" : undefined}
                    rel={d.external ? "noopener noreferrer" : undefined}
                    className="brand-cta-outline mt-5"
                  >
                    {d.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            Your signed SAFTs
          </h2>
          {signed.length === 0 ? (
            <div className="brand-card p-6 text-white/50 text-sm">
              No signed SAFTs yet. Once you reserve a tier and complete
              the SAFT flow, your signed copies will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {signed.map((a) => (
                <a
                  key={a.id}
                  href={`/api/saft/${a.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-card flex items-center justify-between px-5 py-4 transition hover:border-[#00F5D4]/40"
                  data-testid={`signed-saft-${a.id}`}
                >
                  <div>
                    <div className="font-medium">{a.displayName}</div>
                    <div className="text-xs text-white/50">
                      Signed {new Date(a.saftSignedAt!).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[#00F5D4] text-sm">
                    <Download className="w-4 h-4" /> Download PDF
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
