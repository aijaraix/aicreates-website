import { motion } from "framer-motion";
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
  useSeo({
    title: "Terms of Service",
    description:
      "The terms governing use of the AIcreatesAI website, products, and investor portal.",
    path: "/terms",
  });
  return (
    <div className="flex flex-col w-full">
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.08),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionLabel>Legal</SectionLabel>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-5xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
          >
            Terms of Service.
          </motion.h1>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/40">Last updated · January 2026</p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-10 text-white/65 leading-relaxed">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Use of the site</h2>
            <p>The www.aicreates.ai website is provided by AIcreatesAI for informational purposes. By accessing or using the site you agree to these terms. If you do not agree, please do not use the site.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Content and intellectual property</h2>
            <p>All content on this site - including text, graphics, logos, design, and the AIcreatesAI brand - is the property of AIcreatesAI or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written permission.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Forward-looking statements</h2>
            <p>Descriptions of products, capabilities, and roadmap on this site - including the Agentic Intelligence Layer, Eve OS, NeoBank, and the Litepaper - represent current intent and direction, not guarantees. Plans and timelines may change.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Disclaimers</h2>
            <p>The site is provided on an as-is, as-available basis without warranties of any kind. AIcreatesAI is not liable for any indirect, incidental, or consequential damages arising from your use of the site.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Changes</h2>
            <p>We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Contact</h2>
            <p>Questions about these terms: <a href="mailto:sholom@aicreates.ai" className="text-[#00F5D4] hover:underline">sholom@aicreates.ai</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
