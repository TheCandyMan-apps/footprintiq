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
              Exposure Intelligence Above Removal Services
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Most removal services attempt blind takedowns. FootprintIQ maps your full exposure first — so every action is strategic and prioritized.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: Map,
              title: "Map",
              description: "Discover every public trace across hundreds of sources.",
            },
            {
              icon: Target,
              title: "Prioritize",
              description: "Score and rank exposures by severity and remediation effort.",
            },
            {
              icon: BarChart3,
              title: "Reduce",
              description: "Follow a strategic plan with opt-out links and action steps.",
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
