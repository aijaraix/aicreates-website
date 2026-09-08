import { Link } from "wouter";
import { ArrowUpRight, FileText, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/useSeo";

export default function Invest() {
  useSeo({
    title: "Investor relations",
    description:
      "Get to know AI Creates AI and EVE CXO. Contact the team for current investor materials and a conversation about the company.",
    path: "/opportunity",
  });
  return (
    <div className="relaunch-page">
      <section className="relaunch-hero">
        <div className="relaunch-wrap">
          <div className="relaunch-section-heading">
            <p className="relaunch-eyebrow">Investor relations</p>
            <h1>
              A business built around
              <br />
              <span>coordinated intelligence.</span>
            </h1>
            <p className="relaunch-lede">
              AI Creates AI is the company behind EVE CXO, the AI Operating
              System for Business. Our focus is turning coordinated AI into
              useful, governed work for customers.
            </p>
          </div>
          <div className="relaunch-actions">
            <Button asChild className="rounded-full h-12 px-6 teal-btn">
              <Link href="/contact?interest=Investor">
                Contact investor relations{" "}
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 px-6 glass-btn"
            >
              <Link href="/eve-cxo">Explore EVE CXO</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="relaunch-section">
        <div className="relaunch-wrap">
          <div className="relaunch-section-heading">
            <p className="relaunch-eyebrow">A considered conversation</p>
            <h2>
              Start with the company.
              <br />
              Follow the evidence.
            </h2>
            <p>
              We welcome conversations with investors who want to understand the
              product, its customers and the work ahead.
            </p>
          </div>
          <div className="relaunch-roles">
            <article>
              <Users aria-hidden="true" />
              <h3 className="relaunch-small-title">Meet the team</h3>
              <p>
                Discuss the business, product priorities and the questions that
                matter to your investment process.
              </p>
            </article>
            <article>
              <FileText aria-hidden="true" />
              <h3 className="relaunch-small-title">
                Request current materials
              </h3>
              <p>
                The team provides appropriate materials for your review. Access
                to confidential documents is approved separately.
              </p>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <h3 className="relaunch-small-title">Review with care</h3>
              <p>
                Proposed terms, financial scenarios and company information
                should be reviewed with your advisers. This page does not accept
                investments or create a financing commitment.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="relaunch-section">
        <div className="relaunch-wrap relaunch-audiences">
          <div>
            <h2>Already in a conversation?</h2>
            <p>
              Use your existing investor account or contact the team for help
              with access and current materials.
            </p>
          </div>
          <div className="relaunch-audience-links">
            <a href="https://invest.aicreates.ai/invest/">
              Existing investor portal <ArrowUpRight aria-hidden="true" />
            </a>
            <Link href="/contact?interest=Investor">
              Ask the investor relations team{" "}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
