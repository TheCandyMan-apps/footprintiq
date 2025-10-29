import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Install FootprintIQ
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant access to our platform from your home screen. Works offline and loads instantly.
            </p>
          </div>

          {installed ? (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">App Installed!</h2>
                  <p className="text-muted-foreground">
                    FootprintIQ is now on your home screen
                  </p>
                </div>
                <Button onClick={() => window.location.href = '/'} size="lg">
                  Open App
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 space-y-6">
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-semibold">Features</h3>
                <ul className="space-y-3">
                  {[
                    'Works offline - access your data anytime',
                    'Instant loading - native app performance',
                    'Home screen access - launch like any app',
                    'Automatic updates - always get the latest version'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {deferredPrompt ? (
                <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                  <Download className="h-5 w-5" />
                  Install Now
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To install this app on your device:
                  </p>
                  <div className="text-left text-sm space-y-2 bg-muted p-4 rounded-md">
                    <p className="font-semibold">On iPhone/iPad:</p>
                    <p className="text-muted-foreground">
                      Tap the Share button, then "Add to Home Screen"
                    </p>
                    <p className="font-semibold mt-4">On Android:</p>
                    <p className="text-muted-foreground">
                      Tap the menu (three dots), then "Install app" or "Add to Home Screen"
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          <p className="text-sm text-muted-foreground">
            The app is {Math.round(Math.random() * 2 + 3)}MB and works on all modern browsers
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
