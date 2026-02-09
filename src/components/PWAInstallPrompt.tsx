import { useState, useEffect } from "react";
import { X, Download, Smartphone, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_COUNT_KEY = "fpiq_session_count";
const PROMPT_DISMISSED_KEY = "fpiq_install_dismissed";
const INSTALLED_KEY = "fpiq_pwa_installed";

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
};

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true ||
        localStorage.getItem(INSTALLED_KEY)) {
      return;
    }

    // Check if user dismissed the prompt
    if (localStorage.getItem(PROMPT_DISMISSED_KEY)) {
      return;
    }

    setIsIOS(isIOSSafari());

    // Track sessions (only increment once per browser session)
    const sessionTracked = sessionStorage.getItem('fpiq_session_tracked');
    if (!sessionTracked) {
      sessionStorage.setItem('fpiq_session_tracked', 'true');
      const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || "0");
      const newSessionCount = sessionCount + 1;
      localStorage.setItem(SESSION_COUNT_KEY, newSessionCount.toString());

      // Show prompt after 2 sessions
      if (newSessionCount >= 2) {
        setShowPrompt(true);
      }
    } else {
      // Check if we should show based on existing session count
      const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || "0");
      if (sessionCount >= 2) {
        setShowPrompt(true);
      }
    }

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android Chrome: use native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, "true");
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
    // iOS: the button is not shown; instructions are displayed instead
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <Card className="p-4 shadow-elevated border-primary/20 bg-card/95 backdrop-blur-lg">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Install FootprintIQ
                </h3>
                {isIOS ? (
                  <p className="text-sm text-muted-foreground">
                    Tap <Share className="inline w-4 h-4 align-text-bottom mx-0.5" /> <strong>Share</strong>, then <strong>Add to Home Screen</strong> to install
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add to your home screen for quick access and offline support
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {isIOS ? (
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="flex-1 touch-target"
                  >
                    Got it
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleInstall}
                      size="sm"
                      className="flex-1 touch-target"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                      className="touch-target"
                    >
                      Later
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
