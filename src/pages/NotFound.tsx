import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { analytics } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Track 404 in Plausible analytics
    analytics.pageNotFound(
      location.pathname,
      document.referrer,
      location.search
    );
    
    // Log to database for detailed analysis
    supabase
      .from('page_not_found_events')
      .insert({
        path: location.pathname,
        referrer: document.referrer || null,
        search: location.search || null,
        user_agent: navigator.userAgent
      })
      .then(({ error }) => {
        if (error) console.error('Failed to log 404 event:', error);
      });
  }, [location.pathname, location.search]);

  return (
    <>
      <Helmet>
        <title>Page Not Found - FootprintIQ</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you're looking for doesn't exist. Return to FootprintIQ homepage." />
        <link rel="canonical" href="https://footprintiq.app/" />
      </Helmet>
      
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="mb-4 text-8xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" onClick={() => window.history.back()}>
              <span className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
