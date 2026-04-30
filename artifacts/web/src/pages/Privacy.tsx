import { Link } from "wouter";
import { motion } from "framer-motion";

const SECTIONS: { id: string; heading: string; body: React.ReactNode }[] = [
  {
    id: "overview",
    heading: "1. Overview",
    body: (
      <>
        <p>
          AIcreatesAI ("AIcreatesAI", "we", "our", or "us") is a technology company building agentic AI systems, intelligent business infrastructure, and next-generation digital products. This Privacy Policy explains how we collect, use, share, and protect information in connection with our website at aicreates.ai (the "Site"), our chat assistant ("Eve"), our products including Fin, and any other services we offer (collectively, the "Services").
        </p>
        <p>
          By using the Services you agree to the practices described here. If you do not agree, please do not use the Services.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    heading: "2. Information we collect",
    body: (
      <>
        <p>We collect a small amount of information, only what we need to operate and improve the Services.</p>
        <p className="font-semibold text-white mt-4">Information you provide directly</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your name, email address, company, role, and any message content when you submit our contact form, join a waitlist, or request information.</li>
          <li>Messages and any details you choose to share with our chat assistant Eve, including any email address you provide for follow-up.</li>
          <li>Account, identity, and transaction information you provide if and when you onboard onto our products such as Fin, governed by separate product terms.</li>
        </ul>
        <p className="font-semibold text-white mt-4">Information collected automatically</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Basic device and connection information such as IP address, browser type, operating system, referring page, and pages viewed.</li>
          <li>Standard server and security logs used for fraud prevention, abuse detection, and rate limiting.</li>
          <li>Local browser storage used to remember your conversation with Eve so it persists across page navigations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "3. How we use information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Operate, maintain, and secure the Services.</li>
          <li>Respond to inquiries, schedule conversations, and follow up on engagement requests.</li>
          <li>Provide and improve our chat assistant Eve, including delivering replies and forwarding lead details to our team when you ask to be contacted.</li>
          <li>Detect, prevent, and address fraud, abuse, security incidents, and violations of our Terms of Service.</li>
          <li>Comply with legal obligations and enforce our agreements.</li>
        </ul>
        <p className="mt-4">
          We do not sell your personal information. We do not use your conversations with Eve to train third-party AI models.
        </p>
      </>
    ),
  },
  {
    id: "ai-and-eve",
    heading: "4. The Eve chat assistant",
    body: (
      <>
        <p>
          Eve is an AI-powered chat assistant. When you send a message to Eve, the message and the recent conversation context are processed by a third-party large language model provider on our behalf to generate a reply. We do not allow that provider to use your messages to train its models.
        </p>
        <p className="mt-3">
          If, during a conversation with Eve, you provide an email address or ask to be contacted, the conversation transcript and your contact details are forwarded by email to our team so that a human can follow up with you. Treat conversations with Eve the same way you would treat sending us an email: do not share passwords, payment information, government IDs, or other highly sensitive data through the chat.
        </p>
        <p className="mt-3">
          Eve may occasionally be inaccurate or incomplete. For anything important, please contact us directly via the contact form.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "5. How we share information",
    body: (
      <>
        <p>We share information only in the following limited circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-semibold text-white">Service providers.</span> Vendors who help us operate the Services, including our hosting provider, our email and form-submission provider, and the language model provider that powers Eve. These providers are contractually limited to processing data on our behalf.
          </li>
          <li>
            <span className="font-semibold text-white">Legal and safety.</span> When we believe in good faith that disclosure is required by law, regulation, legal process, or to protect the rights, property, or safety of AIcreatesAI, our users, or others.
          </li>
          <li>
            <span className="font-semibold text-white">Business transfers.</span> In connection with a merger, acquisition, financing, reorganization, or sale of assets, in which case your information may be transferred subject to standard confidentiality protections.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    heading: "6. Data retention",
    body: (
      <p>
        We retain personal information for as long as necessary to provide the Services, comply with our legal obligations, resolve disputes, and enforce our agreements. Contact form submissions and Eve transcripts forwarded to our team are retained in our email systems under our standard email retention practices. You may request deletion at any time by contacting us at the address below.
      </p>
    ),
  },
  {
    id: "security",
    heading: "7. Security",
    body: (
      <p>
        We use reasonable administrative, technical, and organizational measures to protect information, including encrypted transport (HTTPS), origin and rate-limit controls on our chat endpoint, and access controls on internal systems. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "8. Your choices and rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have rights under applicable data protection laws (including GDPR, UK GDPR, and the California Consumer Privacy Act) to access, correct, delete, port, or restrict processing of your personal information, and to object to certain uses. You may exercise these rights by emailing us at sholom@aicreates.ai.
        </p>
        <p className="mt-3">
          You can clear your local Eve conversation history at any time by clicking the reset button inside the chat panel, or by clearing your browser site data.
        </p>
      </>
    ),
  },
  {
    id: "international",
    heading: "9. International transfers",
    body: (
      <p>
        We are based in the United States and our service providers may operate in other countries. By using the Services you understand that your information may be transferred to, stored in, and processed in jurisdictions other than your own. Where required, we use appropriate safeguards for international transfers.
      </p>
    ),
  },
  {
    id: "children",
    heading: "10. Children",
    body: (
      <p>
        The Services are not directed to children under 16, and we do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "11. Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date below. Material changes will be highlighted on the Site. Your continued use of the Services after an update constitutes acceptance of the revised policy.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "12. Contact us",
    body: (
      <p>
        Questions or requests regarding this Privacy Policy can be sent to{" "}
        <a href="mailto:sholom@aicreates.ai" className="text-primary hover:underline">
          sholom@aicreates.ai
        </a>{" "}
        or through our{" "}
        <Link href="/contact"><span className="text-primary hover:underline cursor-pointer">contact form</span></Link>.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="flex flex-col w-full">
      <section className="relative pt-32 md:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(110,86,207,0.15),transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-6 inline-block">
              Legal
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gradient mb-6 leading-[1.1]">
              Privacy Policy
            </h1>
            <p className="text-white/50 text-base">Last updated: April 30, 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-8 md:p-12 space-y-10 text-white/70 leading-relaxed">
              {SECTIONS.map((s) => (
                <div key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">
                    {s.heading}
                  </h2>
                  <div className="space-y-3 text-[15px]">{s.body}</div>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm text-center mt-8">
              See also our{" "}
              <Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms of Service</span></Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
