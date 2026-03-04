import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, ArrowRight, Globe, User, Link2, Shield, Eye,
  Network, BookOpen, AlertTriangle, CheckCircle2, Fingerprint,
  FileText, Layers, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ─── Simulated platform database ─── */
const PLATFORMS = [
  { name: 'GitHub', category: 'Development', icon: '🔧', risk: 'low' },
  { name: 'Twitter / X', category: 'Social', icon: '🐦', risk: 'medium' },
  { name: 'Reddit', category: 'Forum', icon: '🟠', risk: 'medium' },
  { name: 'Instagram', category: 'Social', icon: '📸', risk: 'high' },
  { name: 'LinkedIn', category: 'Professional', icon: '💼', risk: 'medium' },
  { name: 'TikTok', category: 'Social', icon: '🎵', risk: 'high' },
  { name: 'Steam', category: 'Gaming', icon: '🎮', risk: 'low' },
  { name: 'Pinterest', category: 'Creative', icon: '📌', risk: 'low' },
  { name: 'Spotify', category: 'Music', icon: '🎧', risk: 'low' },
  { name: 'YouTube', category: 'Video', icon: '▶️', risk: 'medium' },
  { name: 'Telegram', category: 'Messaging', icon: '✈️', risk: 'high' },
  { name: 'Medium', category: 'Writing', icon: '✍️', risk: 'low' },
  { name: 'Twitch', category: 'Streaming', icon: '🟣', risk: 'medium' },
  { name: 'Mastodon', category: 'Social', icon: '🐘', risk: 'low' },
  { name: 'Keybase', category: 'Identity', icon: '🔑', risk: 'low' },
  { name: 'HackerNews', category: 'Tech', icon: '📰', risk: 'low' },
] as const;

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  high: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
};

/* ─── OSINT Learning Cards data ─── */
const LEARNING_CARDS = [
  {
    icon: User,
    title: 'Username Reuse',
    description: 'When the same handle is used across platforms, it creates a traceable link between accounts — even if profiles contain different personal details.',
    severity: 'high',
  },
  {
    icon: FileText,
    title: 'Metadata Analysis',
    description: 'Photos, documents, and posts embed hidden metadata (EXIF, timestamps, device info) that can reveal location, habits, and device patterns.',
    severity: 'medium',
  },
  {
    icon: Network,
    title: 'Profile Correlation',
    description: 'Matching writing style, posting times, or mutual connections across platforms helps analysts link accounts to the same individual.',
    severity: 'high',
  },
  {
    icon: Shield,
    title: 'Breach Exposure',
    description: 'Leaked credentials from data breaches can confirm email–username links and reveal which services a person has registered with.',
    severity: 'high',
  },
  {
    icon: Layers,
    title: 'Behavioural Fingerprinting',
    description: 'Unique language patterns, emoji usage, timezone activity, and engagement habits create a behavioural signature that persists across accounts.',
    severity: 'medium',
  },
  {
    icon: Globe,
    title: 'Domain & DNS Recon',
    description: 'WHOIS history, DNS records, and certificate transparency logs reveal who owns or controls web infrastructure — even after details are hidden.',
    severity: 'low',
  },
];

/* ─── Example Investigation data ─── */
const EXAMPLE_PLATFORMS = [
  { platform: 'GitHub', found: true, username: 'cyber_analyst', detail: 'Active contributor, 47 repos' },
  { platform: 'Twitter / X', found: true, username: 'cyber_analyst', detail: 'Infosec tweets, joined 2019' },
  { platform: 'Reddit', found: true, username: 'cyber_analyst', detail: 'Posts in r/netsec, r/osint' },
  { platform: 'LinkedIn', found: true, username: 'cyber-analyst', detail: 'Security Engineer profile' },
  { platform: 'Steam', found: false, username: '', detail: '' },
  { platform: 'Keybase', found: true, username: 'cyber_analyst', detail: 'PGP key linked' },
  { platform: 'Medium', found: true, username: 'cyber_analyst', detail: '12 published articles' },
  { platform: 'HackerNews', found: true, username: 'cyber_analyst', detail: 'Karma: 3,400' },
];

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  for (let i = copy.length - 1; i > 0; i--) {
    h = (h * 16807 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ─── Section wrapper ─── */
const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={cn('w-full', className)}
  >
    {children}
  </motion.section>
);

/* ─── Main Page ─── */
export default function OsintPlayground() {
  const [username, setUsername] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState<typeof PLATFORMS | null>(null);

  const handleSimulate = useCallback(() => {
    if (!username.trim()) return;
    setSimulating(true);
    setSimResults(null);
    // Deterministic shuffle based on username for repeatable demo
    setTimeout(() => {
      const shuffled = seededShuffle([...PLATFORMS], username.trim().toLowerCase());
      const count = 6 + (username.length % 5); // 6-10 results
      setSimResults(shuffled.slice(0, Math.min(count, shuffled.length)));
      setSimulating(false);
    }, 1400);
  }, [username]);

  const graphNodes = useMemo(() => {
    if (!simResults) return [];
    return simResults.slice(0, 8);
  }, [simResults]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Interactive OSINT Playground — FootprintIQ',
    description: 'Explore open-source intelligence techniques interactively. Learn about username reuse, profile correlation, and digital footprint analysis.',
    url: 'https://footprintiq.app/osint-playground',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Interactive OSINT Playground — FootprintIQ</title>
        <meta name="description" content="Explore how open-source intelligence techniques reveal digital footprints. Try the username exposure simulator, learn OSINT techniques, and see a sample investigation." />
        <link rel="canonical" href="https://footprintiq.app/osint-playground" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden border-b border-border/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20 relative">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 border-primary/30 text-primary">
                <Fingerprint className="w-3 h-3" />
                Educational Tool
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Interactive OSINT Playground
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore how open-source intelligence techniques reveal digital footprints. All simulations use fictional data — no real lookups are performed.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-24">

          {/* ─── Module 1: Username Exposure Simulator ─── */}
          <Section>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Username Exposure Simulator
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter any username to see a simulated view of where it could appear online. This is a demonstration — no real data is queried.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. cyber_analyst"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                  className="flex-1 h-11"
                />
                <Button onClick={handleSimulate} disabled={!username.trim() || simulating} className="h-11 px-5 gap-2">
                  {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Simulate
                </Button>
              </div>

              {simulating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Simulating exposure across platforms…
                </div>
              )}

              {simResults && !simulating && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">{simResults.length}</strong> potential platform matches found for <span className="font-mono text-primary">@{username.trim()}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {simResults.map((p) => (
                      <div key={p.name} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/60 px-3 py-2.5">
                        <span className="text-lg">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[9px] h-5 px-1.5', RISK_COLORS[p.risk])}>
                          {p.risk}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Section>

          {/* ─── Module 2: Digital Footprint Visualizer ─── */}
          <Section>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Digital Footprint Visualizer
                </h2>
                <p className="text-sm text-muted-foreground">
                  See how a single username connects profiles across platforms, creating a traceable digital footprint.
                </p>
              </div>

              {graphNodes.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative bg-card/40 border border-border/30 rounded-xl p-6 sm:p-10 min-h-[320px] overflow-hidden"
                >
                  {/* Central node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-[10px] text-center text-primary font-medium mt-1.5 truncate max-w-[100px]">
                      @{username.trim()}
                    </p>
                  </div>

                  {/* Orbiting nodes */}
                  {graphNodes.map((node, i) => {
                    const angle = (i / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
                    const rx = 38; // % from center
                    const ry = 36;
                    const cx = 50 + rx * Math.cos(angle);
                    const cy = 50 + ry * Math.sin(angle);

                    return (
                      <motion.div
                        key={node.name}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                        className="absolute z-10"
                        style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        {/* Connection line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '200px', height: '200px', left: '-100px', top: '-100px', overflow: 'visible' }}>
                          <line
                            x1="100" y1="100"
                            x2={100 + (50 - cx) * 2} y2={100 + (50 - cy) * 2}
                            stroke="hsl(var(--primary) / 0.15)"
                            strokeWidth="1"
                            strokeDasharray="4 3"
                          />
                        </svg>
                        <div className="relative w-11 h-11 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm text-base">
                          {node.icon}
                        </div>
                        <p className="text-[9px] text-muted-foreground text-center mt-1 truncate max-w-[70px]">
                          {node.name}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="bg-card/40 border border-border/30 rounded-xl p-10 text-center">
                  <Network className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Run the username simulator above to generate a footprint visualization.
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* ─── Module 3: OSINT Learning Cards ─── */}
          <Section>
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  OSINT Techniques Explained
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  Core open-source intelligence methods used by professionals and researchers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LEARNING_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card key={card.title} className="bg-card/70 border-border/40 hover:border-border/60 transition-colors duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold leading-tight">{card.title}</CardTitle>
                            <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5', RISK_COLORS[card.severity])}>
                              {card.severity} exposure risk
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* ─── Module 4: Example Investigation ─── */}
          <Section>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Example Investigation
                </h2>
                <p className="text-sm text-muted-foreground">
                  A sample username investigation for <span className="font-mono text-primary">@cyber_analyst</span>, demonstrating how platform overlap is identified.
                </p>
              </div>

              <Card className="bg-card/70 border-border/40 overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">@cyber_analyst</CardTitle>
                      <p className="text-xs text-muted-foreground">Username investigation across 8 platforms</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px] h-5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                      {EXAMPLE_PLATFORMS.filter(p => p.found).length} matches
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/15">
                    {EXAMPLE_PLATFORMS.map((p) => (
                      <div key={p.platform} className="flex items-center gap-3 px-4 py-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                          p.found ? 'bg-green-500/15' : 'bg-muted/30'
                        )}>
                          {p.found
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            : <AlertTriangle className="w-3 h-3 text-muted-foreground/40" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{p.platform}</p>
                          {p.found && <p className="text-[10px] text-muted-foreground truncate">{p.detail}</p>}
                        </div>
                        {p.found ? (
                          <span className="text-[10px] text-primary font-mono">@{p.username}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40 italic">Not found</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Investigation insight */}
                  <div className="px-4 py-3 bg-muted/10 border-t border-border/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Insight:</strong> The username <span className="font-mono text-primary">@cyber_analyst</span> was found on 7 of 8 platforms, confirming consistent username reuse. Cross-referencing activity patterns and posting times could further validate identity correlation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ─── CTA ─── */}
          <Section>
            <div className="max-w-2xl mx-auto text-center space-y-6 py-4">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Ready to scan your own footprint?
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  FootprintIQ runs real OSINT scans across hundreds of platforms using Maigret, Sherlock, and more — delivering actionable intelligence in minutes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2 px-8">
                  <Link to="/scan">
                    <Search className="w-4 h-4" />
                    Start a Free Scan
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/blog/osint-beginners-guide">
                    <BookOpen className="w-4 h-4" />
                    Read the OSINT Guide
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Public sources only</span>
                <span>•</span>
                <span>Ethical OSINT</span>
                <span>•</span>
                <span>No monitoring</span>
              </div>
            </div>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
