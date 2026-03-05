import { useParams, Navigate } from "react-router-dom";
import { FAQHubTemplate } from "@/components/templates/FAQHubTemplate";
import { getFAQHub } from "@/lib/seo/faqHubData";

export default function FAQPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/" replace />;

  const entry = getFAQHub(slug);
  if (!entry) return <Navigate to="/404" replace />;

  return <FAQHubTemplate entry={entry} />;
}
