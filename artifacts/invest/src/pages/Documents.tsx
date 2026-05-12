import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
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
    title: "Litepaper",
    blurb:
      "Long-form positioning of the agentic intelligence layer, hybrid compute fabric, and Eve OS.",
    href: "https://www.aicreates.ai/litepaper",
    cta: "Read on aicreates.ai",
    external: true,
  },
  {
    title: "Round terms summary",
    blurb:
      "AICA Founders Round - tier table, pricing, target raise, deadline, and payment options.",
    href: "https://www.aicreates.ai/invest",
    cta: "View terms",
    external: true,
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
    href: "/invest/faq#risk",
    cta: "Read risk factors",
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
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <h1
          className="text-3xl md:text-4xl font-semibold tracking-tight mb-3"
          style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
        >
          <span className="text-[#00F5D4]">Documents</span>
        </h1>
        <p className="text-white/60 mb-10 max-w-2xl">
          Everything you need to evaluate and finalize your AICA Founders
          Commitment.
        </p>

        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            Round materials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATIC_DOCS.map((d) => (
              <div
                key={d.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col"
                data-testid={`doc-card-${d.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-2 text-[#00F5D4]">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-[0.14em]">
                    Document
                  </span>
                </div>
                <h3
                  className="mt-3 text-xl font-semibold"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
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
                ) : (
                  <a
                    href={d.href}
                    target={d.external ? "_blank" : undefined}
                    rel={d.external ? "noopener noreferrer" : undefined}
                    className="mt-5 inline-flex items-center justify-center h-10 px-4 rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10 text-sm"
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white/50 text-sm">
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
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 hover:border-[#00F5D4]/40"
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
