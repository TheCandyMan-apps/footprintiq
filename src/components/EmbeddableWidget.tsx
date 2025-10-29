import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WidgetProps {
  branded?: boolean;
}

export const EmbeddableWidget = ({ branded = true }: WidgetProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const handleCheck = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { 
          provider: 'hibp',
          target: username,
          options: { type: 'username' }
        }
      });

      if (error) throw error;
      
      // Mock results for demo - replace with actual multi-platform check
      setResults({
        'Twitter': Math.random() > 0.5,
        'GitHub': Math.random() > 0.5,
        'Reddit': Math.random() > 0.5,
        'Instagram': Math.random() > 0.5,
      });
    } catch (error) {
      console.error('Widget check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Check Username Availability</h3>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
          <Button onClick={handleCheck} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
          </Button>
        </div>

        {results && (
          <div className="space-y-2">
            {Object.entries(results).map(([platform, available]) => (
              <div key={platform} className="flex items-center justify-between">
                <span>{platform}</span>
                {available ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Available
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" /> Taken
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {branded && (
          <a 
            href="https://footprintiq.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Made with FootprintIQ <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </Card>
  );
};

export const generateEmbedCode = (branded: boolean = true) => {
  const code = `<iframe 
  src="https://footprintiq.app/embed/widget?branded=${branded}" 
  width="400" 
  height="300" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`;
  return code;
};
