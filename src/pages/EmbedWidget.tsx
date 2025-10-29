import { EmbeddableWidget } from "@/components/EmbeddableWidget";

const EmbedWidget = () => {
  const params = new URLSearchParams(window.location.search);
  const branded = params.get('branded') !== 'false';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <EmbeddableWidget branded={branded} />
    </div>
  );
};

export default EmbedWidget;
