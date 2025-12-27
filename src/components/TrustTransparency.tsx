import { CheckCircle, AlertCircle, XCircle, BarChart3 } from "lucide-react";

const classificationOptions = [
  {
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Marked as Likely Benign",
    color: "text-success",
  },
  {
    icon: <AlertCircle className="w-5 h-5" />,
    label: "Flagged as Context-Dependent",
    color: "text-warning",
  },
  {
    icon: <XCircle className="w-5 h-5" />,
    label: "Dismissed as a False Positive",
    color: "text-muted-foreground",
  },
];

export const TrustTransparency = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Designed to Reduce False Positives
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every signal can be reviewed, reclassified, and refined based on real-world investigator feedback.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {classificationOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
            >
              <div className={`flex-shrink-0 ${option.color}`}>
                {option.icon}
              </div>
              <span className="text-sm text-muted-foreground">
                {option.label}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">
            Confidence adjusts based on real-world investigator feedback.
          </p>
        </div>
      </div>
    </section>
  );
};
