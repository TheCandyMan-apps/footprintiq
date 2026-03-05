import { useParams, Navigate } from "react-router-dom";
import { ComparisonTemplate } from "@/components/templates/ComparisonTemplate";
import { getComparisonEntry } from "@/lib/seo/comparisonRegistry";

export default function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <Navigate to="/compare" replace />;

  const entry = getComparisonEntry(slug);
  
  if (!entry) return <Navigate to="/compare" replace />;

  return <ComparisonTemplate entry={entry} />;
}
