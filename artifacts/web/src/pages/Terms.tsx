import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function Terms() {
  const { t, i18n } = useTranslation();
  useSeo({
    title: t("terms.seo.title"),
    description: t("terms.seo.description"),
    path: "/terms",
  });
  const showCanonicalNote = i18n.language && !i18n.language.startsWith("en");
  return (
    <div className="flex flex-col w-full">
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.08),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionLabel>{t("terms.eyebrow")}</SectionLabel>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-5xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
          >
            {t("terms.title")}
          </motion.h1>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/40">{t("terms.lastUpdated")}</p>
          {showCanonicalNote && (
            <p className="mt-3 text-sm text-white/50">{t("terms.canonicalNote")}</p>
          )}
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-10 text-white/65 leading-relaxed">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.use.title")}</h2>
            <p>{t("terms.body.use.text")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.ip.title")}</h2>
            <p>{t("terms.body.ip.text")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.forward.title")}</h2>
            <p>{t("terms.body.forward.text")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.disclaimers.title")}</h2>
            <p>{t("terms.body.disclaimers.text")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.changes.title")}</h2>
            <p>{t("terms.body.changes.text")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">{t("terms.body.contact.title")}</h2>
            <p>
              {t("terms.body.contact.prefix")} <a href="mailto:sholom@aicreates.ai" className="text-[#00F5D4] hover:underline">sholom@aicreates.ai</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
