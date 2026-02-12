import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function RemovalIsOneStep() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">
        Why Removal Is Only One Step
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Removing your information from a data broker or search engine reduces your surface exposure, but it is
        not a permanent solution on its own. Data brokers continuously refresh their databases from public records
        and commercial sources, meaning new listings may appear weeks or months after a successful removal.
      </p>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        Ongoing monitoring helps you detect re-listings early and maintain lower exposure over time. Combining
        removal with regular scans provides the most effective approach to managing your digital footprint.
      </p>
      <Link
        to="/scan"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors"
      >
        Run a Username Exposure Scan
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
