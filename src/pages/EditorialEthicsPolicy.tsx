import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const EditorialEthicsPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Editorial & Ethics Policy | FootprintIQ</title>
        <meta
          name="description"
          content="FootprintIQ's editorial and ethics policy outlines our commitment to responsible OSINT practices, user privacy, and transparent communication."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://footprintiq.app/editorial-ethics-policy" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Editorial & Ethics Policy",
            description:
              "FootprintIQ's editorial and ethics policy outlines our commitment to responsible OSINT practices, user privacy, and transparent communication.",
            publisher: {
              "@type": "Organization",
              name: "FootprintIQ",
              url: "https://footprintiq.app",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          <article className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Editorial & Ethics Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                This document defines the ethical standards, editorial principles, and operational boundaries governing FootprintIQ.
              </p>
            </header>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
              {/* Section 1: Our Purpose */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Our Purpose
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ exists to help individuals understand their digital footprint. We provide tools and educational resources that enable users to see what publicly available information exists about them online.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our purpose is to promote informed, calm decision-making. We do not seek to alarm or manipulate. Instead, we aim to reduce harm caused by misunderstanding, misinformation, or fear around online exposure.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Digital awareness should be accessible, accurate, and empowering. FootprintIQ is built on this principle.
                </p>
              </section>

              <Separator />

              {/* Section 2: Editorial Principles */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Editorial Principles
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All content published by FootprintIQ adheres to the following editorial principles:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-foreground min-w-[180px]">Accuracy over speed.</span>
                    <span>We prioritise correctness and verification. Content is reviewed for factual accuracy before publication.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-foreground min-w-[180px]">Context over alarm.</span>
                    <span>We present information within its proper context, avoiding sensationalism or exaggeration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-foreground min-w-[180px]">Education over persuasion.</span>
                    <span>Our goal is to inform and educate, not to convince or convert.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-foreground min-w-[180px]">Transparency over obscurity.</span>
                    <span>We explain our methods, sources, and limitations openly.</span>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  All published material undergoes internal review for clarity, tone, and factual correctness.
                </p>
              </section>

              <Separator />

              {/* Section 3: Ethical Use of OSINT */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Ethical Use of OSINT
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  OSINT (Open Source Intelligence) refers to the collection and analysis of information from publicly accessible sources. This includes public social media profiles, websites, forums, government records, and other data available without authentication or special access.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  FootprintIQ uses OSINT methodologies exclusively. We do not access private databases, restricted systems, or information obtained through illegal means. All data sources used by FootprintIQ are publicly available and legally accessible.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our use of OSINT is for awareness and education. We help individuals understand what information about them is publicly visible. We do not use OSINT for exploitation, targeting, or any purpose that could cause harm to individuals.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This distinction is fundamental to our operations and non-negotiable.
                </p>
              </section>

              <Separator />

              {/* Section 4: What FootprintIQ Does Not Do */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. What FootprintIQ Does Not Do
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FootprintIQ explicitly does not engage in the following activities:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>We do not monitor individuals.</li>
                  <li>We do not track user activity beyond what is necessary for service delivery.</li>
                  <li>We do not conduct surveillance of any kind.</li>
                  <li>We do not sell, resell, or broker personal data.</li>
                  <li>We do not provide tools or services designed to enable harassment, targeting, or doxxing.</li>
                  <li>We do not operate as a data broker or people-search service.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  These boundaries are absolute and define what FootprintIQ will never become.
                </p>
              </section>

              <Separator />

              {/* Section 5: Data Handling & User Respect */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Data Handling & User Respect
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ operates with respect for user privacy at every level. We collect only the minimum data necessary to provide our services. We do not sell user data to third parties.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Scan results and user-generated data are handled with care and discretion. Users retain control over their information and can request deletion at any time.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our approach to data handling reflects our broader ethical commitments: user trust is earned through consistent, respectful behaviour.
                </p>
              </section>

              <Separator />

              {/* Section 6: Responsible Communication */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Responsible Communication
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FootprintIQ maintains strict standards for how we communicate with users and the public. We avoid:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Fear-based messaging designed to provoke anxiety or panic.</li>
                  <li>Absolutist claims about privacy, security, or protection.</li>
                  <li>Promises of total anonymity or complete removal of online presence.</li>
                  <li>Misleading representations of risk or threat levels.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We recognise that exposure does not automatically equal harm. The presence of public information is not inherently dangerous, and we communicate this nuance consistently.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our communications are designed to inform, not to frighten.
                </p>
              </section>

              <Separator />

              {/* Section 7: Appropriate & Inappropriate Use */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Appropriate & Inappropriate Use
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FootprintIQ is designed for the following use cases:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-6">
                  <li>Personal awareness of one's own digital footprint.</li>
                  <li>Educational purposes and digital literacy training.</li>
                  <li>Ethical research conducted with appropriate permissions and oversight.</li>
                  <li>Organisational security assessments with proper authorisation.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The following uses are expressly prohibited:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Harassment, stalking, or intimidation of any individual.</li>
                  <li>Surveillance without consent or legal authority.</li>
                  <li>Coercion, blackmail, or any form of exploitation.</li>
                  <li>Compiling dossiers on individuals for malicious purposes.</li>
                  <li>Any activity that violates applicable laws or regulations.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Users who violate these terms may have their access revoked without notice.
                </p>
              </section>

              <Separator />

              {/* Section 8: Corrections & Accountability */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Corrections & Accountability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ is committed to accuracy and accountability. When errors are identified in our content, tools, or communications, we correct them promptly and transparently.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We welcome feedback from users, researchers, and the public. Constructive criticism helps us improve our services and better serve our community.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Continuous improvement is not optional; it is a core operational principle.
                </p>
              </section>

              <Separator />

              {/* Section 9: Closing Statement */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Commitment
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  FootprintIQ operates with ethical intent, user-first design, and a commitment to transparency. We believe that digital awareness tools should empower individuals, not exploit them.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This policy reflects who we are and how we operate. It is not aspirational; it is operational.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4 font-medium text-foreground">
                  We are accountable to these standards.
                </p>
              </section>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-12">
              For definitions and OSINT explainers, see{" "}
              <Link to="/ai-answers-hub" className="underline underline-offset-4 hover:text-primary">
                AI Answers
              </Link>.
            </p>

            <footer className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026
              </p>
            </footer>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EditorialEthicsPolicy;
