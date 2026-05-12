import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
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
        q: "What is the AICA Founders Round?",
        a: "The first allocation round of the AICA token. AICA powers consumptive access to the agentic intelligence layer (Eve OS, Hybrid Compute Fabric). Pricing is fixed per AICA with tiered allocation bonuses at $5k and $25k.",
      },
      {
        q: "When does the round close?",
        a: "December 31, 2026, or earlier on hitting the hard cap. Closing dates can move forward only - never backward.",
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
        q: "Can I cancel or refund my commitment?",
        a: "Until your funds are received, you can cancel by contacting the team. Once funds clear, refunds are at the company's discretion and may be processed via the original payment method.",
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
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <h1
          className="text-3xl md:text-4xl font-semibold tracking-tight mb-3"
          style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
        >
          <span className="text-[#00F5D4]">FAQ</span>
        </h1>
        <p className="text-white/60 mb-10">
          The questions investors ask most. Reach out at{" "}
          <a
            href="mailto:sholom@aicreates.ai"
            className="text-[#00F5D4] hover:underline"
          >
            sholom@aicreates.ai
          </a>{" "}
          for anything not covered here.
        </p>

        <div className="space-y-10">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
                {g.title}
              </h2>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
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
