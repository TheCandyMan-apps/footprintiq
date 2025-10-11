import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleStartScan = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-background">
      <Hero onStartScan={handleStartScan} />
    </main>
  );
};

export default Index;
