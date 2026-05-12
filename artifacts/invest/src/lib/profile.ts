import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface InvestorProfile {
  userId: string;
  kind: "individual" | "business";
  email: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  legalFirstName: string | null;
  legalLastName: string | null;
  dateOfBirth: string | null;
  taxIdLast4: string | null;
  legalEntityName: string | null;
  entityType: string | null;
  jurisdictionOfFormation: string | null;
  countryOfFormation: string | null;
  dateOfFormation: string | null;
  einLast4: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => api<{ profile: InvestorProfile | null }>("/me/profile"),
  });
}

export function profileLegalName(p: InvestorProfile): string {
  if (p.kind === "business") return (p.signatoryName ?? "").trim();
  return `${p.legalFirstName ?? ""} ${p.legalLastName ?? ""}`
    .trim()
    .replace(/\s+/g, " ");
}

export function profileDisplayName(p: InvestorProfile): string {
  if (p.kind === "business") {
    return p.legalEntityName ?? p.signatoryName ?? p.email;
  }
  const n = `${p.legalFirstName ?? ""} ${p.legalLastName ?? ""}`.trim();
  return n || p.email;
}
