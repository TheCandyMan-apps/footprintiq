import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, Shield, CheckCircle, Sparkles, Users, Fingerprint, BarChart3, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const tools = [
  {
    icon: Search,
    title: "Username Search",
    description: "Search a username across 500+ platforms to find where it appears online.",
    href: "/username-search",
  },
  {
    icon: Shield,
    title: "Digital Footprint Checker",
    description: "Audit your digital presence and discover what personal data is publicly visible.",
    href: "/digital-footprint-check",
  },
  {
    icon: CheckCircle,
    title: "Username Availability Checker",
    description: "Check whether a username is available or already claimed on popular platforms.",
    href: "/username-checker",
  },
  {
    icon: Sparkles,
    title: "Username Generator",
    description: "Generate unique, memorable usernames based on your preferences and interests.",
    href: "/username-search",
  },
  {
    icon: Users,
    title: "Social Profile Finder",
    description: "Locate public social media profiles linked to a specific handle or identity.",
    href: "/social-media-finder",
  },
  {
    icon: Fingerprint,
    title: "Username OSINT Tool",
    description: "Run an ethical OSINT scan to trace a username across platforms and correlate identities.",
    href: "/scan",
  },
  {
    icon: BarChart3,
    title: "Digital Exposure Calculator",
    description: "Calculate your Digital Exposure Score and understand your online risk profile.",
    href: "/check-my-digital-footprint",
  },
];

export default function Tools() {
  return (
    <>
      <Helmet>
        <title>Digital Footprint Tools | FootprintIQ</title>
        <meta
          name="description"
          content="Explore FootprintIQ's suite of OSINT and digital footprint tools. Search usernames, check exposure, find social profiles, and audit your online presence."
        />
        <link rel="canonical" href="https://footprintiq.lovable.app/tools" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              FootprintIQ Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of ethical digital footprint and OSINT tools — scan, audit, and protect your online presence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                to={tool.href}
                className="group p-6 rounded-xl bg-card border border-border shadow-card hover:border-primary/50 hover:shadow-elevated transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {tool.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
