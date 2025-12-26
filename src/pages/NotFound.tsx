import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
