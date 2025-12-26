import { Button } from "@/components/ui/button";
import { Shield, Search, FileText, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
interface HeroProps {
  onStartScan: () => void;
  onAdvancedScan?: () => void;
}
export const Hero = ({
  onStartScan,
  onAdvancedScan
}: HeroProps) => {
  return <section className="relative min-h-[90vh] flex items-center justify-center bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
          See what the internet knows about you
          <span className="block text-primary mt-2"> before someone else does.</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          FootprintIQ scans thousands of public sources to uncover exposed usernames, profiles, breaches, and digital risks.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" onClick={onStartScan} className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" asChild>
            <Link to="/auth">
              <Search className="w-5 h-5 mr-2" />
              Run a Free Scan
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 h-auto border-2 hover:bg-muted" asChild>
            <Link to="/sample-report">
              <FileText className="w-5 h-5 mr-2" />
              View Sample Report
            </Link>
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Results in minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>100+ sources scanned</span>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard icon={<Search className="w-6 h-6" />} title="Username & Identity Scanning" description="Discover where your usernames appear across hundreds of platforms and data sources." />
          <FeatureCard icon={<Shield className="w-6 h-6" />} title="Breach Detection" description="Find out if your credentials have been exposed in known data breaches." />
          <FeatureCard icon={<FileText className="w-6 h-6" />} title="Actionable Reports" description="Get clear, evidence-based findings with steps to protect your privacy." />
        </div>
      </div>
    </section>;
};
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
const FeatureCard = ({
  icon,
  title,
  description
}: FeatureCardProps) => {
  return <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>;
};