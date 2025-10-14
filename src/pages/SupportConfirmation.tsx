import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Ticket, Clock, Mail } from "lucide-react";

const RESPONSE_TIMES = {
  low: "2-3 business days",
  normal: "1-2 business days",
  high: "4-8 hours",
  urgent: "1-2 hours"
};

const SupportConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketNumber = searchParams.get('ticket');
  const [priority, setPriority] = useState<string>("normal");

  useEffect(() => {
    if (!ticketNumber) {
      navigate('/support');
    }
  }, [ticketNumber, navigate]);

  if (!ticketNumber) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Card className="p-8 bg-gradient-card border-border shadow-card text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Support Ticket Created!</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for contacting us. Your support ticket has been successfully created.
          </p>

          <div className="bg-background/50 rounded-lg p-6 mb-8 border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ticket className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Ticket Number</span>
            </div>
            <p className="text-2xl font-mono font-bold text-primary">{ticketNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Save this number to track your ticket
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">Estimated Response Time</p>
                <p className="text-sm text-muted-foreground">
                  {RESPONSE_TIMES[priority as keyof typeof RESPONSE_TIMES]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">Email Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for ticket details and updates
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/my-tickets')} size="lg">
              <Ticket className="w-4 h-4 mr-2" />
              View My Tickets
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              Return Home
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need immediate assistance?{" "}
            <a href="mailto:support@footprintiq.app" className="text-primary hover:underline">
              Email us directly
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupportConfirmation;
