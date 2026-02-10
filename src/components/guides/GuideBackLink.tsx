import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function GuideBackLink() {
  return (
    <Link
      to="/guides"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
    >
      <ArrowLeft className="w-3 h-3" />
      Back to Guides
    </Link>
  );
}
