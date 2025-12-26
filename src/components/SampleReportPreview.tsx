import { FileText, MapPin, AlertTriangle, BarChart3, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: <MapPin className="w-4 h-4" />,
    label: "Where data was found",
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "What type of exposure it represents",
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    label: "Confidence levels",
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Severity indicators",
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    label: "Practical actions you can take",
  },
];

export const SampleReportPreview = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Clear, readable reports
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your report highlights:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Designed to be understandable — not overwhelming.
        </p>

        <div className="text-center">
          <Button size="lg" variant="outline" className="border-2" asChild>
            <Link to="/sample-report">
              <FileText className="w-5 h-5 mr-2" />
              View Sample Report
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
