import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is FootprintIQ?",
    answer: "FootprintIQ is a free online privacy tool that shows you what's publicly visible about you on the internet. It checks usernames, emails, and phone numbers across hundreds of public sources to help you understand your exposure and take action."
  },
  {
    question: "Is FootprintIQ free to use?",
    answer: "Yes! Free scans show where exposure exists across public sources. You don't need to sign up or create an account. Pro scans provide deeper analysis, explain how identifiers connect, and provide evidence you can use for data removal requests."
  },
  {
    question: "What does FootprintIQ scan?",
    answer: "FootprintIQ scans publicly accessible sources including social platforms, forums, breach indexes, data broker listings, and people-search sites. We check for username reuse, email exposure, and data broker listings to build a clear picture of your online visibility."
  },
  {
    question: "Is my data private when using FootprintIQ?",
    answer: "Yes — we analyse publicly available information only and never store or sell your personal data. All scans are user-initiated, and we don't monitor or track your activity. Your privacy is our top priority."
  },
  {
    question: "Can I use FootprintIQ to look up other people?",
    answer: "FootprintIQ is designed for self-assessment — checking your own digital footprint. While scans can be run on any public username, the platform is built around consent, transparency, and ethical use. It is not a people-search site or background check service."
  },
  {
    question: "How is FootprintIQ different from Have I Been Pwned?",
    answer: "Have I Been Pwned focuses specifically on breach data for emails. FootprintIQ provides broader digital footprint analysis including username reuse across 350+ platforms, data broker listings, and connections between public identifiers — plus a step-by-step cleanup plan."
  },
  {
    question: "How is FootprintIQ different from a removal service?",
    answer: "Removal services delete listings blindly. FootprintIQ maps your full exposure first — so you know exactly what to prioritise. We provide a structured remediation roadmap with official opt-out links and removal guidance, so every action is strategic."
  },
  {
    question: "Is this legal and ethical?",
    answer: "Yes. FootprintIQ only accesses publicly available information — the same data anyone can find through search engines and public databases. We use ethical OSINT techniques and never access private accounts or bypass authentication. FootprintIQ is designed around transparency, consent, and false-positive reduction."
  },
  {
    question: "What is OSINT and why does it matter?",
    answer: "OSINT stands for Open Source Intelligence — it simply means searching publicly available information. Think of it like Googling yourself, but across hundreds of sources at once. Understanding what's publicly visible about you is the first step to managing your digital privacy."
  },
  {
    question: "Does FootprintIQ remove my data?",
    answer: "FootprintIQ does not directly remove data from third-party platforms. Instead, it maps your exposure and provides a structured remediation roadmap — including official opt-out links and removal guidance — so you can act efficiently and strategically."
  },
  {
    question: "Do I need technical knowledge to use FootprintIQ?",
    answer: "Not at all. FootprintIQ is designed for everyone — no technical background required. Enter a username, email, or phone number and get plain-language results with clear next steps. Every finding includes an explanation of what it means and what you can do about it."
  },
  {
    question: "What can I do after I get my results?",
    answer: "Your results include a prioritised remediation plan with specific actions: removing data broker listings, closing unused accounts, opting out of people-search sites, and strengthening your privacy settings. Pro users get a full exportable cleanup roadmap."
  },
  {
    question: "Is FootprintIQ safe to use?",
    answer: "Yes. FootprintIQ is verified by ScamAdviser, uses encrypted connections, and never stores your scan data. We don't require an account for free scans, and we never share your information with third parties."
  },
  {
    question: "Where do reputation signals come from?",
    answer: "We combine multiple intelligence sources and internal heuristics to produce derived signals. We don't provide raw feeds or monitoring."
  }
];

export const FAQ = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about protecting your digital footprint
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="group bg-gradient-card border border-border/50 hover:border-accent/50 rounded-2xl px-8 shadow-sm hover:shadow-[0_0_20px_rgba(0,230,230,0.1)] transition-all duration-300"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-bold text-lg group-hover:text-accent transition-colors">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};