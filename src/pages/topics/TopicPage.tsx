import { useParams, Navigate } from "react-router-dom";
import { TopicHubTemplate } from "@/components/templates/TopicHubTemplate";
import { getTopicHub } from "@/lib/seo/topicHubData";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/" replace />;
  
  const entry = getTopicHub(slug);
  if (!entry) return <Navigate to="/404" replace />;

  return <TopicHubTemplate entry={entry} />;
}
