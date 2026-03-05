import { useParams, Navigate } from "react-router-dom";
import { PlatformUsernameSearchTemplate } from "@/components/templates/PlatformUsernameSearchTemplate";
import { getPlatformEntry, normaliseSlug } from "@/lib/seo/platformRegistry";

export default function PlatformPage() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <Navigate to="/platforms" replace />;

  const normalised = normaliseSlug(slug);
  
  // Redirect to normalised slug if different
  if (normalised !== slug) {
    return <Navigate to={`/platforms/${normalised}/username-search`} replace />;
  }

  const entry = getPlatformEntry(slug);
  
  if (!entry) return <Navigate to="/platforms" replace />;

  return <PlatformUsernameSearchTemplate entry={entry} />;
}
