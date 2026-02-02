import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditPackCardProps {
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  onPurchase: () => void;
  loading?: boolean;
}

export function CreditPackCard({
  name,
  credits,
  price,
  popular = false,
  onPurchase,
  loading = false,
}: CreditPackCardProps) {
  const pricePerCredit = (price / credits).toFixed(3);
  const scansEstimate = Math.floor(credits / 5); // Assuming avg 5 credits per scan

  return (
    <Card className={`relative p-6 hover:shadow-lg transition-all ${popular ? 'ring-2 ring-primary' : ''}`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className="text-4xl font-bold">£{price}</span>
            <span className="text-muted-foreground text-sm">one-time</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
            <Zap className="w-5 h-5" />
            <span>{credits.toLocaleString()} Credits</span>
          </div>
          <p className="text-xs text-muted-foreground">
            £{pricePerCredit} per credit
          </p>
        </div>

        <div className="space-y-2 text-sm text-left pt-4 border-t">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>~{scansEstimate} full OSINT scans</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Credits never expire</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Use across all features</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Instant delivery</span>
          </div>
        </div>

        {/* Important clarification about credits vs Pro */}
        <TooltipProvider>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-left">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                <p>Credits are for scan usage. To unlock additional OSINT providers (Sherlock, HIBP, phone tools) and premium features (AI insights, exports), you need a Pro subscription.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Credits only.</strong> Does not unlock Pro features or additional providers.
            </p>
          </div>
        </TooltipProvider>

        <Button 
          className="w-full mt-2" 
          size="lg"
          onClick={onPurchase}
          disabled={loading}
        >
          {loading ? "Processing..." : "Buy Now"}
        </Button>
      </div>
    </Card>
  );
}
