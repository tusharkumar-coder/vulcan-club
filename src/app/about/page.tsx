import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { ArrowRight, Compass, Handshake, Lightbulb, Wrench } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Our mission, principles, and learning culture at Vulcan Club.",
  ...canonicalMetadata("/about"),
};

const principles = [
  [
    "Make it real",
    "A working prototype teaches things a slide deck can’t. We learn by building, testing, and improving real software.",
    Wrench,
  ],
  [
    "Stay curious",
    "Questions are part of the work. We make space to explore unfamiliar tools, ideas, and approaches.",
    Lightbulb,
  ],
  [
    "Build with care",
    "Useful software comes from understanding people, constraints, trade-offs, and the consequences of our choices.",
    Compass,
  ],
  [
    "Share the forge",
    "We trade notes, review one another’s work, and make the path easier for the person coming next.",
    Handshake,
  ],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The club / About"
        title="Learn by making. Grow by sharing."
        description="Vulcan Club is a student developer community at Mirai School of Technology, built around thoughtful practice and collaborative work."
      />
      <section className="section">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">Our mission</div>
            <h2 className="section-heading">Make engineering a shared practice.</h2>
            <p className="section-copy">
              We create a place where students can explore how software works, work through hard
              questions, build useful things, and learn alongside people with different strengths.
            </p>
            <p className="section-copy" style={{ marginTop: 18 }}>
              The ambition is straightforward: help more students become confident, generous, and
              capable engineers through projects, practice, mentorship, and open exchange.
            </p>
          </div>
          <div
            className="split-visual"
            aria-label="Abstract workshop-inspired geometric illustration"
          >
            <div className="visual-label mono">
              <span>DESIGN PRINCIPLE / 01</span>
              <span>FORM → FUNCTION</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section-sm section-line">
        <div className="shell">
          <div className="eyebrow mono">What guides us</div>
          <h2 className="section-heading">Good work has good company.</h2>
          <div className="card-grid">
            {principles.map(([title, copy, Icon], index) => (
              <article className="card" key={title}>
                <span className="card-index">0{index + 1} / PRINCIPLE</span>
                <span className="card-arrow">
                  <Icon size={17} />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-line">
        <div className="shell split">
          <div>
            <div className="eyebrow mono">A broad technical home</div>
            <h2 className="section-heading">Different paths. Shared momentum.</h2>
            <p className="section-copy">
              Competitive programming, web and app development, AI and machine learning, open-source
              contribution, and systems work all belong here. Members can go deep in a domain or
              connect ideas across them.
            </p>
            <div style={{ marginTop: 26 }}>
              <Link href="/domains" className="text-link">
                Find your direction <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div>
            <div className="roadmap-step">
              <span>01</span>
              <div>
                <h3>Try something small</h3>
                <p>Join a study session, workshop, or project conversation.</p>
              </div>
            </div>
            <div className="roadmap-step">
              <span>02</span>
              <div>
                <h3>Find a collaborator</h3>
                <p>Share your starting point and learn alongside someone else.</p>
              </div>
            </div>
            <div className="roadmap-step">
              <span>03</span>
              <div>
                <h3>Pass it forward</h3>
                <p>Write down what worked and make the next first step clearer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-line">
        <div className="shell">
          <div className="eyebrow mono">Get involved</div>
          <h2 className="section-heading">There’s no single right way to start.</h2>
          <p className="section-copy">
            Browse a domain, attend a public club event, look through the resource shelf, or send us
            a note about an idea you’d like to explore.
          </p>
          <div className="hero-actions">
            <Link href="/events" className="button">
              Explore events <ArrowRight size={14} />
            </Link>
            <Link href="/join" className="text-link">
              Express interest <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
