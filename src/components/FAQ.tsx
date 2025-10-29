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
    answer: "Your digital footprint is the trail of data you leave behind when using the internet. This includes your personal information on data broker sites, social media profiles, search results, and public records. Data brokers collect and sell this information without your consent."
  },
  {
    question: "How does footprintiq remove my data?",
    answer: "footprintiq scans over 100+ data broker and people search sites to find your personal information. We then submit removal requests on your behalf and follow up until your data is removed. Our automated system continuously monitors for new appearances of your data."
  },
  {
    question: "How long does the removal process take?",
    answer: "Initial removal requests are submitted within 24 hours of your scan. Most data brokers respond within 7-45 days. Some sites have faster removal processes, while others may take longer. We handle all follow-ups and keep you updated on the progress."
  },
  {
    question: "Is my information safe with footprintiq?",
    answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We only use your information to submit removal requests to data brokers. We never sell or share your information with third parties. Your privacy is our top priority."
  },
  {
    question: "What types of information can be removed?",
    answer: "We can help remove various types of personal information including your name, address, phone number, email, age, relatives, property records, and more from data broker sites. However, some public records maintained by government agencies cannot be removed."
  },
  {
    question: "Do I need to stay subscribed for protection?",
    answer: "While you can use our service for a one-time cleanup, staying subscribed provides ongoing protection. Data brokers continuously collect new information, so continuous monitoring ensures your data stays removed and alerts you to new exposures."
  },
  {
    question: "What is OSINT and why does it matter?",
    answer: "OSINT (Open Source Intelligence) refers to information collected from publicly available sources. Malicious actors use OSINT techniques to gather information about individuals. Our service identifies what information about you is available through OSINT methods and helps remove it."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you'll continue to have access to your account until the end of your current billing period."
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