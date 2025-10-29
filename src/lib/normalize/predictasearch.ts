export interface PredictaSearchResult {
  platform: string;
  email?: string;
  username?: string;
  user_id?: string;
  name?: string;
  link?: string;
  pfp_image?: string;
  source?: string;
  breach_name?: string;
  breach_domain?: string;
  date?: string;
  pwn_count?: number;
  description?: string;
  logo_path?: string;
  data_classes?: string[];
  is_verified?: boolean;
  following_count?: number;
  followers_count?: number;
  likes_count?: number;
  photos_count?: number;
  created_at?: string;
  last_login_date?: string;
  gender?: string;
  age?: number;
  country?: string;
  display_name?: string;
  is_online?: boolean;
  is_rated?: boolean;
  best_rating?: number;
  best_rating_type?: string;
}

export interface PredictaSearchNormalized {
  source: string;
  category: 'social' | 'breach' | 'leak' | 'identity';
  findings: Array<{
    type: 'profile' | 'breach' | 'account' | 'data_leak';
    platform: string;
    url?: string;
    username?: string;
    email?: string;
    userId?: string;
    displayName?: string;
    avatar?: string;
    verified?: boolean;
    stats?: {
      followers?: number;
      following?: number;
      posts?: number;
      rating?: number;
    };
    metadata?: Record<string, any>;
    breach?: {
      name: string;
      domain: string;
      date: string;
      count: number;
      description: string;
      dataClasses: string[];
    };
    lastSeen?: string;
    createdAt?: string;
  }>;
  summary: {
    totalProfiles: number;
    totalBreaches: number;
    platforms: string[];
    verifiedAccounts: number;
    mostRecentActivity?: string;
  };
  riskScore: number;
}

export function normalizePredictaSearch(
  raw: PredictaSearchResult[]
): PredictaSearchNormalized {
  const findings = raw.map((item) => {
    // Determine if this is a breach or profile
    const isBreach = item.source === 'hibp' || item.breach_name || item.data_classes;
    
    if (isBreach) {
      return {
        type: 'breach' as const,
        platform: item.platform,
        breach: {
          name: item.breach_name || 'Unknown Breach',
          domain: item.breach_domain || '',
          date: item.date || '',
          count: item.pwn_count || 0,
          description: item.description || '',
          dataClasses: item.data_classes || [],
        },
      };
    }

    // Social/profile data
    return {
      type: 'profile' as const,
      platform: item.platform,
      url: item.link,
      username: item.username,
      email: item.email,
      userId: item.user_id,
      displayName: item.name || item.display_name,
      avatar: item.pfp_image,
      verified: item.is_verified,
      stats: {
        followers: item.followers_count,
        following: item.following_count,
        posts: item.photos_count,
        rating: item.best_rating,
      },
      metadata: {
        gender: item.gender,
        age: item.age,
        country: item.country,
        isOnline: item.is_online,
        isRated: item.is_rated,
        ratingType: item.best_rating_type,
      },
      lastSeen: item.last_login_date,
      createdAt: item.created_at,
    };
  });

  const profiles = findings.filter((f) => f.type === 'profile');
  const breaches = findings.filter((f) => f.type === 'breach');
  const platforms = [...new Set(findings.map((f) => f.platform))];
  const verifiedAccounts = profiles.filter((p) => p.verified).length;

  // Calculate risk score based on findings
  let riskScore = 0;
  riskScore += breaches.length * 15; // Each breach adds significant risk
  riskScore += profiles.length * 2; // Each profile adds minor risk
  riskScore += verifiedAccounts * 3; // Verified accounts indicate real identity
  riskScore = Math.min(riskScore, 100); // Cap at 100

  // Find most recent activity
  const dates = [
    ...profiles.map((p) => p.lastSeen || p.createdAt).filter(Boolean),
    ...breaches.map((b) => b.breach?.date).filter(Boolean),
  ].filter((d): d is string => !!d);
  
  const mostRecentActivity = dates.length > 0 
    ? dates.sort().reverse()[0] 
    : undefined;

  return {
    source: 'Predicta Search',
    category: breaches.length > profiles.length ? 'breach' : 'social',
    findings,
    summary: {
      totalProfiles: profiles.length,
      totalBreaches: breaches.length,
      platforms,
      verifiedAccounts,
      mostRecentActivity,
    },
    riskScore,
  };
}
