import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using the Vulcan Club website and community information.",
  ...canonicalMetadata("/terms"),
};
export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Notices / Terms"
        title="A few clear expectations."
        description="Use this site respectfully and follow the rules of any external platform linked from it."
      />
      <section className="section">
        <div className="shell legal-copy">
          <h2>Community information</h2>
          <p>
            Website content describes Vulcan Club activities and resources. Event details can
            change; check the event page for the latest information before attending.
          </p>
          <h2>External links</h2>
          <p>
            Links to third-party websites are provided as learning resources. Vulcan Club does not
            control or endorse those sites unless a specific endorsement is stated.
          </p>
          <h2>Contributions</h2>
          <p>
            When sharing projects or resources, submit material you have the right to share and
            respect the licenses, privacy, and work of others.
          </p>
          <h2>Contact</h2>
          <p>
            If you have questions about these terms, please{" "}
            <a href="/contact" style={{ color: "var(--cyan)", textDecoration: "underline" }}>
              contact the club
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
