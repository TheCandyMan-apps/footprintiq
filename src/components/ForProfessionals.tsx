import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, FileText, Search } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Digital Footprint Risk Awareness',
    description:
      "Understand how username reuse, data broker listings, and public profiles contribute to an individual or organisation\u2019s overall exposure surface — helping teams and individuals take informed action.",
  },
  {
    icon: Search,
    title: 'Exposure Assessment Workflows',
    description:
      'Run structured scans across usernames, emails, and phone numbers to identify where information is publicly visible — designed for repeatable, scalable assessment processes.',
  },
  {
    icon: ShieldCheck,
    title: 'Ethical OSINT Analysis',
    description:
      'Every scan follows responsible, public-source-only methodology. FootprintIQ is built for self-audits, authorised investigations, and compliance-aligned research.',
  },
  {
    icon: FileText,
    title: 'Structured Reporting for Professionals',
    description:
      'Generate clear, evidence-backed reports with confidence scoring, source attribution, and actionable findings — ready for risk assessments or client briefings.',
  },
];

export const ForProfessionals = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground">
            For Professionals &amp; Organizations
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-base">
            FootprintIQ scales with your workflow — from individual audits to
            team-based investigations. Responsible, repeatable, and built on
            public-source intelligence principles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border border-border/60 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Whether you're a security consultant, HR professional, or privacy researcher —{' '}
            <Link
              to="/scan"
              className="text-primary font-medium hover:underline"
            >
              start a scan
            </Link>{' '}
            to see FootprintIQ in action.
          </p>
        </div>
      </div>
    </section>
  );
};
