import { Link } from "wouter";
import { ArrowUpRight, ShieldCheck, Network, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/useSeo";
import eveOffice from "@/assets/eve-office.jpg";

const departments = [
  "Marketing",
  "Sales & Acquisition",
  "Advertising",
  "Finance",
  "Operations",
  "Legal & Compliance",
  "Development & Engineering",
];
const principles = [
  {
    Icon: ShieldCheck,
    title: "Authority stays with you.",
    copy: "Consequential actions belong behind clear permissions and approval gates. The person setting the objective stays in control.",
  },
  {
    Icon: Network,
    title: "Work crosses departments.",
    copy: "Sales, marketing, finance and operations share a business objective, with defined responsibilities and accountable handoffs.",
  },
  {
    Icon: BookOpen,
    title: "Context has a source.",
    copy: "Business records, decisions and evidence give work continuity. Customer information belongs within its permitted workspace.",
  },
];

export default function Home() {
  useSeo({
    title: "Building coordinated AI for business",
    fullTitle: "AI Creates AI | The company behind EVE CXO",
    description:
      "AI Creates AI builds EVE CXO, the AI Operating System for Business. Adam works internally, Eve serves customers, and Hermes coordinates their work.",
    path: "/",
  });
  return (
    <div className="relaunch-page">
      <section className="relaunch-hero">
        <div className="relaunch-wrap relaunch-hero-grid">
          <div>
            <p className="relaunch-eyebrow">AI Creates AI</p>
            <h1>
              Intelligence, working
              <br />
              <span>together.</span>
            </h1>
            <p className="relaunch-lede">
              We build EVE CXO — the AI Operating System for Business. One
              executive layer to coordinate your departments, tools and
              decisions around the work that matters.
            </p>
            <div className="relaunch-actions">
              <Button asChild className="rounded-full h-12 px-6 teal-btn">
                <Link href="/eve-cxo">
                  Discover EVE CXO <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full h-12 px-6 glass-btn"
              >
                <Link href="/contact">Talk to our team</Link>
              </Button>
            </div>
            <p className="relaunch-caption">
              The company behind the product. The people behind the decisions.
            </p>
          </div>
          <figure className="relaunch-hero-image">
            <img
              src={eveOffice}
              alt="Eve, the executive intelligence at the centre of EVE CXO"
              width="1280"
              height="720"
              fetchPriority="high"
            />
            <figcaption>
              <span>EVE CXO</span>
              <strong>Your business. A coordinated team.</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="relaunch-section relaunch-product">
        <div className="relaunch-wrap">
          <div className="relaunch-section-heading">
            <p className="relaunch-eyebrow">Our commercial product</p>
            <h2>
              EVE CXO.
              <br />
              The AI Operating System for Business.
            </h2>
            <p>
              Eve is your executive intelligence and chief of staff. Department
              heads and specialists turn objectives into scoped work, return
              evidence, and bring consequential decisions back to you.
            </p>
          </div>
          <div
            className="relaunch-departments"
            aria-label="Seven customer-facing departments"
          >
            {departments.map((name, i) => (
              <div key={name}>
                <span aria-hidden="true">0{i + 1}</span>
                <strong>{name}</strong>
              </div>
            ))}
          </div>
          <Link className="relaunch-text-link" href="/eve-cxo">
            Meet the product and its departments{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="relaunch-section" aria-labelledby="ecosystem-title">
        <div className="relaunch-wrap">
          <div className="relaunch-section-heading">
            <p className="relaunch-eyebrow">One ecosystem. Clear roles.</p>
            <h2 id="ecosystem-title">Built by AI Creates AI.</h2>
            <p>
              A shared foundation connects how we operate internally with the
              product we build for customers.
            </p>
          </div>
          <div className="relaunch-roles">
            <article>
              <span className="relaunch-eyebrow">Inside our company</span>
              <h3>Adam</h3>
              <p>
                Internal executive intelligence for AI Creates AI: company
                priorities, cross-functional work and decisions that remain
                under human authority.
              </p>
            </article>
            <article>
              <span className="relaunch-eyebrow">Inside EVE CXO</span>
              <h3>Eve</h3>
              <p>
                Customer-facing executive intelligence: your objectives, your
                workspace, your departments and your connected business tools.
              </p>
            </article>
            <article>
              <span className="relaunch-eyebrow">Beneath both</span>
              <h3>Hermes</h3>
              <p>
                The shared orchestration and runtime layer: task state,
                delegation, approvals and evidence that give coordinated work
                continuity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="relaunch-section relaunch-principles">
        <div className="relaunch-wrap">
          <div className="relaunch-section-heading">
            <p className="relaunch-eyebrow">What we build around</p>
            <h2>
              Useful autonomy needs
              <br />
              clear boundaries.
            </h2>
          </div>
          <div className="relaunch-roles">
            {principles.map(({ Icon, title, copy }) => (
              <article key={title}>
                <Icon size={25} aria-hidden="true" />
                <h3 className="relaunch-small-title">{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relaunch-section">
        <div className="relaunch-wrap relaunch-audiences">
          <div>
            <p className="relaunch-eyebrow">Build with us</p>
            <h2>Start with a conversation.</h2>
            <p>
              For businesses exploring EVE CXO, partners bringing expertise and
              integrations, and investors getting to know the company.
            </p>
          </div>
          <div className="relaunch-audience-links">
            <Link href="/eve-cxo">
              For your business <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/contact">
              For strategic partners <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/opportunity">
              For investors <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
