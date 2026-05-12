import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { ChevronDown } from "lucide-react";

interface MeResponse {
  user: { role: string };
}

interface FaqItem {
  q: string;
  a: string;
  anchor?: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    title: "Round mechanics",
    items: [
      {
        q: "What is the AICA Strategic Seed Round?",
        a: "The first of five SAFT rounds in the AIcreatesAI private sale. Strategic Seed is priced at $0.015 per AICA for 200M tokens ($3M raise). Subsequent rounds (Private Sale 1, Private Sale 2, Infrastructure, and Community + Launchpad) ladder up to $0.070 per AICA. Aggregate: 1,250,000,000 AICA = 12.5% of the 10,000,000,000 fixed supply, ~$50M target raise.",
      },
      {
        q: "What are the five SAFT rounds?",
        a: "Strategic Seed - $0.015 per AICA, 200M tokens, $3M (open now). Private Sale 1 - $0.025, 200M, $5M. Private Sale 2 - $0.040, 400M, $16M. Infrastructure - $0.055, 350M, $19.25M. Community + Launchpad - $0.070, 100M, $7M.",
      },
      {
        q: "What does the GPU cluster do?",
        a: "Anchored by a $3.5M initial high-end GPU cluster, the Hybrid Compute Fabric brings inference economics in-house. The cluster trains and serves the proprietary models that power Eve OS and the agentic intelligence layer.",
      },
      {
        q: "Which round is open right now?",
        a: "Strategic Seed is the only round currently open. Investors can reserve allocation today at $0.015 per AICA with tiered bonuses at $5k and $25k. Subsequent rounds open later in sequence as Strategic Seed fills.",
      },
      {
        q: "When does the round close?",
        a: "Strategic Seed closes on hitting its $3M hard cap or December 31, 2026, whichever is earlier. Closing dates can move forward only - never backward.",
      },
      {
        q: "What is the minimum / maximum?",
        a: "Minimum commitment is $1,000. Maximum is $10,000,000 per investor. Custom amounts above the published Catalyst tier are negotiated directly.",
      },
    ],
  },
  {
    title: "Token, vesting, TGE",
    items: [
      {
        q: "When is TGE?",
        a: "Target TGE is December 1, 2026. Updates are posted to /documents and to email subscribers.",
      },
      {
        q: "What is the vesting schedule?",
        a: "Default schedule: 25% at TGE, 6-month cliff, then linear monthly over 24 months. Final terms are subject to counsel review.",
      },
      {
        q: "Are tokens locked or transferable?",
        a: "Pre-TGE: SAFT only, no transfer. Post-TGE: tokens are transferable subject to the vesting calendar and any applicable jurisdictional restrictions.",
      },
    ],
  },
  {
    title: "Payment, KYC, and SAFT",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "Card and ACH via Stripe Checkout (recommended under $25k), wire transfer (recommended for $25k+), and USDC crypto via escrow address provided after SAFT signing.",
      },
      {
        q: "How does KYC work?",
        a: "Self-declared accreditation captured on the SAFT. The team reviews and may request supporting documents before marking verified for accreditation-restricted tiers.",
      },
      {
        q: "What does the SAFT cover?",
        a: "The Simple Agreement for Future Tokens (SAFT) is the binding contract for your commitment. It covers identity, accreditation, payment terms, risk acknowledgments, wallet mapping (optional at signing), and a fully signed PDF you can download from the Documents page after completion.",
        anchor: "saft",
      },
      {
        q: "Can I cancel or refund my commitment?",
        a: "Until your funds are received, you can cancel by contacting the team. Once funds clear, refunds are at the company's discretion and may be processed via the original payment method.",
      },
      {
        q: "What about tax treatment?",
        a: "You are solely responsible for the tax treatment of your commitment and any tokens received at TGE or unlock. AIcreatesAI does not issue tax advice. Consult your own tax advisor; you may receive a tax form depending on your jurisdiction.",
        anchor: "tax",
      },
      {
        q: "Which jurisdictions are eligible?",
        a: "The private sale is offered to accredited investors under U.S. Reg D / Reg S exemptions. We currently do not accept commitments from sanctioned jurisdictions or persons on restricted lists. Additional country restrictions may apply at the team's discretion.",
        anchor: "jurisdiction",
      },
      {
        q: "How do I claim my tokens at TGE?",
        a: "After TGE, vested tokens are distributed to the wallet address mapped on your SAFT (or one you provide later). You will receive a claim notification by email when each unlock becomes available; tokens may be auto-distributed or claimable from a portal page depending on the launch chain.",
        anchor: "claim",
      },
    ],
  },
  {
    title: "Risk",
    items: [
      {
        q: "What are the principal risks?",
        a: "This is a high-risk early-stage commitment. You may lose all funds. AICA does not represent equity. The token may be illiquid and have no established secondary market.",
        anchor: "risk",
      },
      {
        q: "What happens if the round doesn't fund?",
        a: "If aggregate commitments do not reach minimum threshold by the deadline, the team may extend, restructure, or refund. Investors are notified directly.",
      },
    ],
  },
];

export default function Faq() {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="Investor FAQ"
        title={<>The questions investors ask most.</>}
        subtitle={
          <>
            Round mechanics, token vesting, KYC and SAFT, payments, and risk -
            in plain language. Anything missing? Email{" "}
            <a
              href="mailto:sholom@aicreates.ai"
              className="text-[#00F5D4] hover:underline"
            >
              sholom@aicreates.ai
            </a>
            .
          </>
        }
      />
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        <div className="space-y-10">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
                {g.title}
              </h2>
              <div className="brand-card divide-y divide-white/5 overflow-hidden">
                {g.items.map((item, i) => {
                  const key = `${g.title}-${i}`;
                  const isOpen = open[key];
                  return (
                    <div key={key} id={item.anchor}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpen((s) => ({ ...s, [key]: !s[key] }))
                        }
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/[0.02]"
                        data-testid={`faq-toggle-${key}`}
                      >
                        <span className="text-sm font-medium">{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-white/50 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-sm text-white/70 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
