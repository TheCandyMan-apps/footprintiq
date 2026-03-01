import { ShieldCheck, Search, Crosshair } from "lucide-react";

const categories = [
  {
    icon: Search,
    title: "People-Search / Data Brokers",
    points: [
      "Background checks, aggregators — often resell data",
      "Designed to find other people",
      "Not focused on consent or self-protection",
    ],
    highlighted: false,
  },
  {
    icon: Crosshair,
    title: "Investigator OSINT Tools",
    points: [
      "Powerful investigative suites",
      "Require expertise and governance frameworks",
      "Not designed for everyday self-audits",
    ],
    highlighted: false,
  },
  {
    icon: ShieldCheck,
    title: "FootprintIQ",
    points: [
      "Ethical OSINT for self-protection",
      "Self-scan → risk reduction → verification",
      "Privacy-first controls + abuse prevention",
    ],
    highlighted: true,
  },
];

export function CategoryComparisonStrip() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">
          How FootprintIQ Compares
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Not all digital-footprint tools serve the same purpose. Here's how the categories differ.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className={`rounded-xl border p-6 flex flex-col gap-4 transition-colors ${
                cat.highlighted
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    cat.highlighted ? "bg-primary/15" : "bg-muted"
                  }`}
                >
                  <cat.icon
                    className={`w-5 h-5 ${
                      cat.highlighted ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-foreground">{cat.title}</h3>
              </div>

              <ul className="space-y-2">
                {cat.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        cat.highlighted ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
