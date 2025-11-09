import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpiderFootScan } from '@/hooks/useSpiderFootScan';
import { Shield, Search, Database, Globe, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface SpiderFootScanFormProps {
  workspaceId: string;
}

const POPULAR_MODULES = [
  { id: 'sfp_dns', name: 'DNS Records', category: 'passive', description: 'Enumerate DNS records' },
  { id: 'sfp_emailrep', name: 'Email Reputation', category: 'passive', description: 'Check email reputation' },
  { id: 'sfp_haveibeenpwned', name: 'Have I Been Pwned', category: 'passive', description: 'Check for data breaches' },
  { id: 'sfp_shodan', name: 'Shodan', category: 'active', description: 'Search Shodan for exposed systems' },
  { id: 'sfp_virustotal', name: 'VirusTotal', category: 'passive', description: 'Check domain/IP reputation' },
  { id: 'sfp_whois', name: 'WHOIS', category: 'passive', description: 'WHOIS domain registration info' },
  { id: 'sfp_socialmedia', name: 'Social Media', category: 'passive', description: 'Find social media profiles' },
  { id: 'sfp_leaklookup', name: 'Leak Lookup', category: 'passive', description: 'Search for leaked credentials' },
];

export function SpiderFootScanForm({ workspaceId }: SpiderFootScanFormProps) {
  const { startScan, isScanning } = useSpiderFootScan();
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState<'email' | 'ip' | 'domain' | 'username' | 'phone'>('email');
  const [selectedModules, setSelectedModules] = useState<string[]>(['sfp_dns', 'sfp_emailrep', 'sfp_whois']);
  const [moduleFilter, setModuleFilter] = useState<'all' | 'passive' | 'active'>('all');

  const filteredModules = POPULAR_MODULES.filter(
    m => moduleFilter === 'all' || m.category === moduleFilter
  );

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!target.trim()) {
      return;
    }

    const scanId = await startScan({
      target: target.trim(),
      target_type: targetType,
      modules: selectedModules,
      workspace_id: workspaceId,
    });

    if (scanId) {
      // Reset form
      setTarget('');
      setSelectedModules(['sfp_dns', 'sfp_emailrep', 'sfp_whois']);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">SpiderFoot OSINT Recon</h2>
              <p className="text-sm text-muted-foreground">
                Run 200+ intelligence gathering modules
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Database className="w-3 h-3 mr-1" />
              10 Credits
            </Badge>
          </div>

          <Separator />

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              SpiderFoot scans use passive reconnaissance modules to gather intelligence ethically.
              Active modules may interact with the target directly.
            </AlertDescription>
          </Alert>

          {/* Target Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Type</Label>
              <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Module Filter</Label>
              <Select value={moduleFilter} onValueChange={(v: any) => setModuleFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="passive">Passive Only</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Input */}
          <div className="space-y-2">
            <Label>Target</Label>
            <Input
              type="text"
              placeholder={`Enter ${targetType}...`}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isScanning}
            />
          </div>

          {/* Module Selection */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>Scan Modules ({selectedModules.length} selected)</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModules([])}
                disabled={isScanning}
              >
                Clear All
              </Button>
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-4 border rounded-lg bg-muted/30">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                    disabled={isScanning}
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={module.id}
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                    >
                      {module.name}
                      <Badge
                        variant={module.category === 'passive' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {module.category}
                      </Badge>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isScanning || !target.trim() || selectedModules.length === 0}
            size="lg"
          >
            {isScanning ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start SpiderFoot Scan
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
