import { Shield } from "lucide-react";
import { BrandCard } from "@/components/brand";

interface Props {
  variant?: "standard" | "investor";
  className?: string;
}

const STANDARD = `Points are internal accounting units. They are not cash and not securities. Token equivalents are projected and subject to vesting (6-month cliff, 24-month linear), KYC, jurisdictional eligibility, and our discretion. Investor introductions are routed to a separate compliance-review track and never receive automatic awards.`;

const INVESTOR = `${STANDARD} This is not an offer to sell securities. Any investment in $AICA tokens or related instruments is offered only to qualified investors via the formal investor portal under separate subscription documents. Genesis points carry no claim on equity, profits, dividends, or repayment, and are voidable by AICreatesAi at our sole discretion in case of fraud, abuse, or regulatory necessity. Eligibility is restricted by jurisdiction; AICreatesAi reserves the right to refuse, suspend, or revoke participation at any time without cause.`;

export default function GenesisDisclaimer({ variant = "standard", className }: Props) {
  const text = variant === "investor" ? INVESTOR : STANDARD;
  return (
    <BrandCard hairline className={`p-5 text-xs text-white/55 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#00F5D4] mt-0.5 shrink-0" />
        <div>
          <strong className="text-white/80">Compliance reminder:</strong> {text}
        </div>
      </div>
    </BrandCard>
  );
}
