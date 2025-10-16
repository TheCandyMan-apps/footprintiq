import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Finding } from "@/lib/ufm";
import { Shield, AlertTriangle, Globe, Server, Phone, User } from "lucide-react";

interface FindingFiltersProps {
  findings: Finding[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FindingFilters = ({ findings, activeTab, onTabChange }: FindingFiltersProps) => {
  const counts = {
    all: findings.length,
    breaches: findings.filter(f => f.type === 'breach').length,
    identity: findings.filter(f => f.type === 'identity').length,
    domain: findings.filter(f => f.type === 'domain_reputation' || f.type === 'domain_tech' || f.type === 'dns_history').length,
    ip: findings.filter(f => f.type === 'ip_exposure').length,
    phone: findings.filter(f => f.type === 'phone_intelligence').length,
    social: findings.filter(f => f.type === 'social_media').length,
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-7 w-full h-auto">
        <TabsTrigger value="all" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </div>
          <Badge variant="secondary" className="text-xs">{counts.all}</Badge>
        </TabsTrigger>
        
        <TabsTrigger value="breaches" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Breaches</span>
          </div>
          {counts.breaches > 0 && (
            <Badge variant="destructive" className="text-xs">{counts.breaches}</Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="identity" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Identity</span>
          </div>
          {counts.identity > 0 && (
            <Badge variant="secondary" className="text-xs">{counts.identity}</Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="domain" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Domain</span>
          </div>
          {counts.domain > 0 && (
            <Badge variant="secondary" className="text-xs">{counts.domain}</Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="ip" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">IP</span>
          </div>
          {counts.ip > 0 && (
            <Badge variant="secondary" className="text-xs">{counts.ip}</Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="phone" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Phone</span>
          </div>
          {counts.phone > 0 && (
            <Badge variant="secondary" className="text-xs">{counts.phone}</Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value="social" className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Social</span>
          </div>
          {counts.social > 0 && (
            <Badge variant="secondary" className="text-xs">{counts.social}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
