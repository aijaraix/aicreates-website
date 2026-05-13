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

export default function Privacy() {
  useSeo({
    title: "Privacy Policy",
    description:
      "How AIcreatesAI collects, uses, and protects your information across the marketing site, products, and investor portal.",
    path: "/privacy",
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
            Privacy Policy.
          </motion.h1>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/40">Last updated · January 2026</p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-10 text-white/65 leading-relaxed">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Overview</h2>
            <p>AIcreatesAI respects your privacy. This page describes what we collect when you visit www.aicreates.ai or contact us, how we use it, and the choices you have. By using the site you agree to the practices described here.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Information we collect</h2>
            <p>When you submit our contact form we collect the name, email, company, role, interest, and message you provide. We collect basic technical information any web server would log (IP, user agent, referrer) for security and analytics. We do not sell, rent, or share your personal information with third parties for their marketing.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">How we use it</h2>
            <p>We use submitted information solely to respond to your inquiry, route you to the right person on our team, and follow up on relevant updates you have asked about. Aggregate technical information is used to operate, secure, and improve the site.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Third-party services</h2>
            <p>Our contact form is delivered via FormSubmit. Site fonts are loaded from Google Fonts. The site is hosted on GitHub Pages. Each provider processes only what is required to deliver its service.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Your choices</h2>
            <p>You can ask us to access, correct, or delete the information you have submitted at any time. Send a request to <a href="mailto:sholom@aicreates.ai" className="text-[#00F5D4] hover:underline">sholom@aicreates.ai</a> and we will respond promptly.</p>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-3">Contact</h2>
            <p>Questions about this policy: <a href="mailto:sholom@aicreates.ai" className="text-[#00F5D4] hover:underline">sholom@aicreates.ai</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
