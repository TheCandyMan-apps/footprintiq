import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Users,
  Heart,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface PredictaProfile {
  platform: string;
  username?: string;
  email?: string;
  name?: string;
  display_name?: string;
  link?: string;
  pfp_image?: string;
  user_id?: string;
  is_verified?: boolean;
  followers_count?: number;
  following_count?: number;
  likes_count?: number;
  photos_count?: number;
  created_at?: string;
  last_login_date?: string;
  gender?: string;
  age?: number;
  country?: string;
  is_online?: boolean;
}

interface PredictaBreach {
  breach_name?: string;
  name?: string;
  breach_domain?: string;
  domain?: string;
  date?: string;
  pwn_count?: number;
  description?: string;
  logo_path?: string;
  data_classes?: string[];
}

interface PredictaLeak {
  source?: string;
  platform?: string;
  date?: string;
  [key: string]: any;
}

interface PredictaSearchResultsProps {
  profiles?: PredictaProfile[];
  breaches?: PredictaBreach[];
  leaks?: PredictaLeak[];
  queryType?: string;
  query?: string;
}

export function PredictaSearchResults({
  profiles = [],
  breaches = [],
  leaks = [],
  queryType,
  query,
}: PredictaSearchResultsProps) {
  const [profilesExpanded, setProfilesExpanded] = useState(true);
  const [breachesExpanded, setBreachesExpanded] = useState(true);
  const [leaksExpanded, setLeaksExpanded] = useState(true);

  const totalFindings = profiles.length + breaches.length + leaks.length;

  if (totalFindings === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Results Found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Predicta Search found no profiles, breaches, or leaks for this query.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Predicta Search Results
            </CardTitle>
            <div className="flex gap-2">
              {profiles.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {profiles.length} Profile{profiles.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {breaches.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {breaches.length} Breach{breaches.length !== 1 ? 'es' : ''}
                </Badge>
              )}
              {leaks.length > 0 && (
                <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                  <Shield className="h-3 w-3" />
                  {leaks.length} Leak{leaks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          {queryType && query && (
            <p className="text-sm text-muted-foreground mt-1">
              Searched <span className="font-medium">{queryType}</span>: {query}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Social Profiles Section */}
      {profiles.length > 0 && (
        <Collapsible open={profilesExpanded} onOpenChange={setProfilesExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {profilesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <User className="h-4 w-4 text-blue-500" />
                    Social Profiles ({profiles.length})
                  </CardTitle>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profiles.map((profile, index) => (
                    <ProfileCard key={`${profile.platform}-${index}`} profile={profile} />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Data Breaches Section */}
      {breaches.length > 0 && (
        <Collapsible open={breachesExpanded} onOpenChange={setBreachesExpanded}>
          <Card className="border-destructive/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {breachesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Data Breaches ({breaches.length})
                  </CardTitle>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {breaches.map((breach, index) => (
                    <BreachCard key={`${breach.breach_name || breach.name}-${index}`} breach={breach} />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Data Leaks Section */}
      {leaks.length > 0 && (
        <Collapsible open={leaksExpanded} onOpenChange={setLeaksExpanded}>
          <Card className="border-yellow-500/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {leaksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Shield className="h-4 w-4 text-yellow-500" />
                    Data Leaks ({leaks.length})
                  </CardTitle>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {leaks.map((leak, index) => (
                    <LeakCard key={`${leak.source}-${index}`} leak={leak} />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: PredictaProfile }) {
  const displayName = profile.name || profile.display_name || profile.username || 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile.pfp_image} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{displayName}</span>
          {profile.is_verified && (
            <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs h-5">
            {profile.platform}
          </Badge>
          {profile.username && (
            <span className="truncate">@{profile.username}</span>
          )}
        </div>
        
        {/* Stats Row */}
        {(profile.followers_count || profile.following_count) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {profile.followers_count !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {profile.followers_count.toLocaleString()}
              </span>
            )}
            {profile.likes_count !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {profile.likes_count.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Online Status */}
        {profile.is_online !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${profile.is_online ? 'bg-green-500' : 'bg-muted'}`} />
            <span className="text-muted-foreground">
              {profile.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
      </div>
      
      {profile.link && (
        <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" asChild>
          <a href={profile.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}

function BreachCard({ breach }: { breach: PredictaBreach }) {
  const breachName = breach.breach_name || breach.name || 'Unknown Breach';
  const domain = breach.breach_domain || breach.domain || '';

  return (
    <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {breach.logo_path ? (
            <img
              src={breach.logo_path}
              alt={breachName}
              className="h-10 w-10 rounded object-contain bg-background p-1"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-sm">{breachName}</h4>
            {domain && (
              <p className="text-xs text-muted-foreground">{domain}</p>
            )}
          </div>
        </div>
        {breach.date && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Calendar className="h-3 w-3" />
            {breach.date}
          </Badge>
        )}
      </div>
      
      {breach.description && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {breach.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {breach.pwn_count && breach.pwn_count > 0 && (
          <Badge variant="outline" className="text-xs">
            {breach.pwn_count.toLocaleString()} records
          </Badge>
        )}
        {breach.data_classes?.slice(0, 4).map((dataClass) => (
          <Badge key={dataClass} variant="secondary" className="text-xs">
            {dataClass}
          </Badge>
        ))}
        {(breach.data_classes?.length || 0) > 4 && (
          <Badge variant="secondary" className="text-xs">
            +{(breach.data_classes?.length || 0) - 4} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function LeakCard({ leak }: { leak: PredictaLeak }) {
  return (
    <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-yellow-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{leak.source || 'Unknown Source'}</h4>
            {leak.platform && (
              <p className="text-xs text-muted-foreground">{leak.platform}</p>
            )}
          </div>
        </div>
        {leak.date && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Calendar className="h-3 w-3" />
            {leak.date}
          </Badge>
        )}
      </div>
    </div>
  );
}
