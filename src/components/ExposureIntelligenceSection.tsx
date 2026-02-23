import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight, Target, Map, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function ExposureIntelligenceSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Your Privacy Journey Starts Here
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Start with FootprintIQ for the full picture, then plug in removal services and identity-protection suites as execution layers. Intelligence first, action second.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: Map,
              title: "Step 1: Map & Score",
              description: "Discover every public trace and score your exposure across hundreds of sources.",
            },
            {
              icon: Target,
              title: "Step 2: Decide & Act",
              description: "Choose what to address yourself with guided checklists vs. what to delegate to removal partners.",
            },
            {
              icon: BarChart3,
              title: "Step 3: Maintain & Monitor",
              description: "Periodic rescans and alerts keep your digital hygiene strong over time.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardContent className="pt-6 space-y-3">
                  <item.icon className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/scan")}
            className="gap-2"
          >
            See Your Remediation Plan
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
