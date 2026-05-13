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
        a: "The first of five SAFT rounds in the AIcreatesAI private sale. Strategic Seed is priced at $0.010 per AICA for 500M tokens ($5M raise, $100M FDV). Subsequent rounds (Private Round 1, Private Round 2, Infrastructure / Strategic, and Community / Launchpad) ladder up to $0.034 per AICA. Aggregate: 2,250,000,000 AICA = 22.5% of the 10,000,000,000 fixed supply, $50M target raise, ~$230M FDV.",
      },
      {
        q: "What are the five SAFT rounds?",
        a: "Strategic Seed - $0.010 per AICA, 500M tokens, $5M, $100M FDV (open now). Private Round 1 - $0.015, 800M, $12M, $150M FDV. Private Round 2 - $0.020, 900M, $18M, $200M FDV. Infrastructure / Strategic - $0.026, 384,615,385, $10M, $260M FDV. Community / Launchpad - $0.034, 147,058,824, $5M, $340M FDV.",
      },
      {
        q: "What does the GPU cluster do?",
        a: "Anchored by a $3.5M initial high-end GPU cluster, the Hybrid Compute Fabric brings inference economics in-house. The cluster trains and serves the proprietary models that power Eve OS and the agentic intelligence layer.",
      },
      {
        q: "Which round is open right now?",
        a: "Strategic Seed is the only round currently open. Investors can reserve allocation today at $0.010 per AICA with tiered bonuses at $5k (+10%) and $25k (+20%). Subsequent rounds open later in sequence as Strategic Seed fills.",
      },
      {
        q: "When does the round close?",
        a: "Strategic Seed closes on hitting its $5M hard cap or December 31, 2026, whichever is earlier. Closing dates can move forward only - never backward.",
      },
      {
        q: "How is the $50M raise being deployed?",
        a: "The $50M raise underwrites the agentic intelligence layer, Eve OS, and the hybrid compute fabric. The first $3.5M anchors a high-end GPU cluster for proprietary model training and inference; the balance funds engineering, go-to-market, ecosystem, and a strategic reserve.",
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
        a: "Vesting is per round - earlier rounds carry longer lockups, later rounds vest faster. Strategic Seed: 3-month cliff, 12-month linear (15-month total lock). Private Round 1: 2-month cliff, 10-month linear (12-month total). Private Round 2: 2-month cliff, 7-month linear (9-month total). Infrastructure / Strategic: 1-month cliff, 5-month linear (6-month total). Community / Launchpad: no cliff, 3-month linear. Toggle the SAFT schedule on your dashboard to compare. Final terms are subject to counsel review.",
      },
      {
        q: "Why does vesting differ by round?",
        a: "Earlier rounds price in more risk and longer time to liquidity, so they carry deeper discounts and longer lockups. Later rounds price closer to TGE and unlock more aggressively. Across all rounds, vesting begins at TGE; after each round's cliff, the linear portion unlocks in equal monthly installments to your mapped wallet.",
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
        a: "Card via Stripe Checkout (Apple Pay and Google Pay supported automatically; recommended under $25k), wire transfer (recommended for $25k+, with full bank details and a downloadable PDF on checkout), and crypto via real on-chain escrows: BTC (Bitcoin), ETH (Ethereum), SOL (Solana), USDC (Base or Ethereum), and USDT (Ethereum). Each escrow accepts only one asset on one network - sending the wrong combination will be lost.",
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
      {
        q: "Where can I see my vesting calendar?",
        a: "Your dashboard shows a per-commitment vesting calendar based on the round you funded into and computes upcoming unlocks. You can also export the full schedule as an .ics calendar file. Switch the SAFT schedule on the dashboard to the Vesting view to compare round-level terms side by side.",
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
