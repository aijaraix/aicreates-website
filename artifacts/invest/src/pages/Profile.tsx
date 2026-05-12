import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useProfile, type InvestorProfile } from "@/lib/profile";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { Loader2, Check, Building2, User as UserIcon } from "lucide-react";

interface FormState {
  kind: "individual" | "business";
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  taxIdLast4: string;
  legalEntityName: string;
  entityType: string;
  jurisdictionOfFormation: string;
  countryOfFormation: string;
  dateOfFormation: string;
  einLast4: string;
  signatoryName: string;
  signatoryTitle: string;
}

const EMPTY: FormState = {
  kind: "individual",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
  legalFirstName: "",
  legalLastName: "",
  dateOfBirth: "",
  taxIdLast4: "",
  legalEntityName: "",
  entityType: "LLC",
  jurisdictionOfFormation: "",
  countryOfFormation: "US",
  dateOfFormation: "",
  einLast4: "",
  signatoryName: "",
  signatoryTitle: "",
};

function fromProfile(p: InvestorProfile | null, fallbackEmail: string, fallbackName: string): FormState {
  if (!p) {
    const [first = "", ...rest] = fallbackName.split(" ");
    return {
      ...EMPTY,
      email: fallbackEmail || "",
      legalFirstName: first,
      legalLastName: rest.join(" "),
    };
  }
  return {
    kind: p.kind,
    email: p.email,
    phone: p.phone ?? "",
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2 ?? "",
    city: p.city,
    region: p.region,
    postalCode: p.postalCode,
    country: p.country,
    legalFirstName: p.legalFirstName ?? "",
    legalLastName: p.legalLastName ?? "",
    dateOfBirth: p.dateOfBirth ?? "",
    taxIdLast4: p.taxIdLast4 ?? "",
    legalEntityName: p.legalEntityName ?? "",
    entityType: p.entityType ?? "LLC",
    jurisdictionOfFormation: p.jurisdictionOfFormation ?? "",
    countryOfFormation: p.countryOfFormation ?? "US",
    dateOfFormation: p.dateOfFormation ?? "",
    einLast4: p.einLast4 ?? "",
    signatoryName: p.signatoryName ?? "",
    signatoryTitle: p.signatoryTitle ?? "",
  };
}

export default function Profile() {
  const { user } = useUser();
  const profile = useProfile();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile.isLoading) return;
    if (hydrated) return;
    setForm(
      fromProfile(
        profile.data?.profile ?? null,
        user?.primaryEmailAddress?.emailAddress ?? "",
        [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      ),
    );
    setHydrated(true);
  }, [profile.data, profile.isLoading, user, hydrated]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        kind: form.kind,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || null,
        city: form.city.trim(),
        region: form.region.trim(),
        postalCode: form.postalCode.trim(),
        country: (form.country.trim() || "US").slice(0, 2).toUpperCase(),
        ...(form.kind === "individual"
          ? {
              legalFirstName: form.legalFirstName.trim(),
              legalLastName: form.legalLastName.trim(),
              dateOfBirth: form.dateOfBirth.trim(),
              taxIdLast4: form.taxIdLast4.replace(/\D/g, "").slice(-4) || null,
            }
          : {
              legalEntityName: form.legalEntityName.trim(),
              entityType: form.entityType.trim(),
              jurisdictionOfFormation: form.jurisdictionOfFormation.trim(),
              countryOfFormation: (form.countryOfFormation.trim() || "US")
                .slice(0, 2)
                .toUpperCase(),
              dateOfFormation: form.dateOfFormation.trim(),
              einLast4: form.einLast4.replace(/\D/g, "").slice(-4) || null,
              signatoryName: form.signatoryName.trim(),
              signatoryTitle: form.signatoryTitle.trim(),
            }),
      };
      return api<{ profile: InvestorProfile }>("/me/profile", {
        method: "PUT",
        body: payload,
      });
    },
    onSuccess: async (saved) => {
      // Prime the cache with the freshly-saved profile BEFORE navigating
      // so RequireProfile (which gates /invest, /saft, /checkout) does
      // not see a stale "no profile" snapshot and bounce the user back
      // to /profile while the invalidation refetch is in flight.
      qc.setQueryData(["me", "profile"], saved);
      await qc.invalidateQueries({ queryKey: ["me", "profile"] });
      const next =
        new URLSearchParams(window.location.search).get("next") ?? "/invest";
      setLocation(next);
    },
    onError: (err) => alert(`Could not save profile: ${(err as Error).message}`),
  });

  const isValid =
    form.email.includes("@") &&
    form.addressLine1.length > 1 &&
    form.city.length > 0 &&
    form.region.length > 0 &&
    form.postalCode.length > 0 &&
    form.country.length === 2 &&
    (form.kind === "individual"
      ? form.legalFirstName.length > 0 &&
        form.legalLastName.length > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)
      : form.legalEntityName.length > 1 &&
        form.signatoryName.length > 1 &&
        form.signatoryTitle.length > 0 &&
        form.jurisdictionOfFormation.length > 0 &&
        form.countryOfFormation.length === 2 &&
        /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfFormation));

  if (profile.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#00F5D4]" /> Loading…
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav />
      <PageHeader
        eyebrow="Investor profile"
        title={<>Confirm your details.</>}
        subtitle="Every commitment and SAFT is auto-filled from this profile. Update once - it carries through every future round."
        back={{ href: "/dashboard", label: "Back to dashboard" }}
      />

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12 space-y-8">
        <section className="brand-card p-6 md:p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, kind: "individual" })}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-full border text-sm font-medium ${
                form.kind === "individual"
                  ? "border-[#00F5D4] bg-[#00F5D4]/10 text-[#00F5D4]"
                  : "border-white/15 text-white/70 hover:bg-white/5"
              }`}
              data-testid="button-profile-kind-individual"
            >
              <UserIcon className="w-4 h-4" /> Individual
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, kind: "business" })}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-full border text-sm font-medium ${
                form.kind === "business"
                  ? "border-[#00F5D4] bg-[#00F5D4]/10 text-[#00F5D4]"
                  : "border-white/15 text-white/70 hover:bg-white/5"
              }`}
              data-testid="button-profile-kind-business"
            >
              <Building2 className="w-4 h-4" /> Business / Entity
            </button>
          </div>

          {form.kind === "individual" ? (
            <Row>
              <Field
                label="Legal first name"
                value={form.legalFirstName}
                onChange={(v) => setForm({ ...form, legalFirstName: v })}
                testId="input-profile-firstname"
              />
              <Field
                label="Legal last name"
                value={form.legalLastName}
                onChange={(v) => setForm({ ...form, legalLastName: v })}
                testId="input-profile-lastname"
              />
            </Row>
          ) : (
            <>
              <Field
                label="Legal entity name"
                value={form.legalEntityName}
                onChange={(v) => setForm({ ...form, legalEntityName: v })}
                testId="input-profile-entityname"
              />
              <Row>
                <Field
                  label="Entity type"
                  value={form.entityType}
                  onChange={(v) => setForm({ ...form, entityType: v })}
                  placeholder="LLC, Inc, Trust, GP…"
                  testId="input-profile-entitytype"
                />
                <Field
                  label="State / Jurisdiction of formation"
                  value={form.jurisdictionOfFormation}
                  onChange={(v) =>
                    setForm({ ...form, jurisdictionOfFormation: v })
                  }
                  placeholder="Delaware"
                  testId="input-profile-jurisdiction"
                />
              </Row>
              <Row>
                <Field
                  label="Country of formation (ISO 2-letter)"
                  value={form.countryOfFormation}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      countryOfFormation: v.toUpperCase().slice(0, 2),
                    })
                  }
                  placeholder="US"
                  testId="input-profile-country-formation"
                />
                <Field
                  label="Date of formation"
                  type="date"
                  value={form.dateOfFormation}
                  onChange={(v) => setForm({ ...form, dateOfFormation: v })}
                  testId="input-profile-date-formation"
                />
              </Row>
              <Row>
                <Field
                  label="Authorized signatory"
                  value={form.signatoryName}
                  onChange={(v) => setForm({ ...form, signatoryName: v })}
                  testId="input-profile-signatory"
                />
                <Field
                  label="Signatory title"
                  value={form.signatoryTitle}
                  onChange={(v) => setForm({ ...form, signatoryTitle: v })}
                  placeholder="Managing Member, CEO…"
                  testId="input-profile-signatory-title"
                />
              </Row>
            </>
          )}

          <Row>
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              testId="input-profile-email"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              testId="input-profile-phone"
            />
          </Row>

          <Field
            label="Address line 1"
            value={form.addressLine1}
            onChange={(v) => setForm({ ...form, addressLine1: v })}
            testId="input-profile-address1"
          />
          <Field
            label="Address line 2"
            value={form.addressLine2}
            onChange={(v) => setForm({ ...form, addressLine2: v })}
            testId="input-profile-address2"
          />
          <Row>
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              testId="input-profile-city"
            />
            <Field
              label="State / Region"
              value={form.region}
              onChange={(v) => setForm({ ...form, region: v })}
              testId="input-profile-region"
            />
          </Row>
          <Row>
            <Field
              label="Postal code"
              value={form.postalCode}
              onChange={(v) => setForm({ ...form, postalCode: v })}
              testId="input-profile-postal"
            />
            <Field
              label="Country (ISO 2-letter)"
              value={form.country}
              onChange={(v) =>
                setForm({ ...form, country: v.toUpperCase().slice(0, 2) })
              }
              testId="input-profile-country"
            />
          </Row>

          {form.kind === "individual" ? (
            <Row>
              <Field
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(v) => setForm({ ...form, dateOfBirth: v })}
                testId="input-profile-dob"
              />
              <Field
                label="SSN/TIN last 4 (optional)"
                value={form.taxIdLast4}
                onChange={(v) =>
                  setForm({
                    ...form,
                    taxIdLast4: v.replace(/\D/g, "").slice(-4),
                  })
                }
                placeholder="1234"
                testId="input-profile-tax-last4"
              />
            </Row>
          ) : (
            <Field
              label="EIN last 4 (optional)"
              value={form.einLast4}
              onChange={(v) =>
                setForm({ ...form, einLast4: v.replace(/\D/g, "").slice(-4) })
              }
              placeholder="1234"
              testId="input-profile-ein-last4"
            />
          )}

          <p className="text-[11px] text-white/40">
            Only the last 4 digits of any tax ID are retained. The full
            value is never persisted.
          </p>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            disabled={!isValid || save.isPending}
            onClick={() => save.mutate()}
            className="brand-cta"
            data-testid="button-profile-save"
          >
            {save.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" /> Save profile
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="brand-input mt-1"
        data-testid={testId}
      />
    </div>
  );
}
