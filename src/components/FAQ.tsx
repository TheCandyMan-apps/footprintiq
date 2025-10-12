import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about protecting your digital footprint
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6 shadow-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};