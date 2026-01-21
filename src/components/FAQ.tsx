import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is a digital footprint?",
    answer: "Your digital footprint is the trail of data you leave behind when using the internet. This includes your personal information on data broker sites, social media profiles, search results, and public records. FootprintIQ helps you see what's publicly visible about you."
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
    question: "Is FootprintIQ free to use?",
    answer: "Yes! Free scans show where exposure exists across public sources. Pro scans provide deeper analysis, explain how identifiers connect, and provide evidence you can use for data removal requests."
  },
  {
    question: "Is this the same as Have I Been Pwned?",
    answer: "FootprintIQ and Have I Been Pwned serve different purposes. HIBP focuses specifically on breach data for emails. FootprintIQ provides broader digital footprint analysis including username reuse, data broker listings, and connections between public identifiers."
  },
  {
    question: "Is this legal and ethical?",
    answer: "Yes. FootprintIQ only accesses publicly available information — the same data anyone can find through search engines and public databases. We use ethical OSINT techniques and never access private accounts or bypass authentication."
  },
  {
    question: "What is OSINT and why does it matter?",
    answer: "OSINT (Open Source Intelligence) refers to information collected from publicly available sources. Understanding what's publicly visible about you is the first step to managing your digital privacy and reducing potential risks."
  },
  {
    question: "Can FootprintIQ remove my data?",
    answer: "Free scans identify where your information is exposed. Pro provides detailed evidence and guidance you can use to submit removal requests to data brokers and platforms. We help you understand what exists so you can take action."
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