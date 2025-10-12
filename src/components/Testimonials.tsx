import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    content: "footprintiq found my information on 47 different data broker sites I didn't even know existed. Within 3 months, they removed 90% of it. Finally, I can sleep peacefully knowing my family's privacy is protected.",
    rating: 5,
    avatar: "SM"
  },
  {
    name: "James Rodriguez",
    role: "Software Engineer",
    content: "As someone in tech, I thought I was careful about my digital footprint. footprintiq proved me wrong and helped clean up years of data exposure. The AI-powered detection is impressive.",
    rating: 5,
    avatar: "JR"
  },
  {
    name: "Emily Chen",
    role: "Journalist",
    content: "In my line of work, privacy is crucial. footprintiq's continuous monitoring alerts me immediately when new data appears. The automated removal process saves me countless hours every month.",
    rating: 5,
    avatar: "EC"
  },
  {
    name: "Michael Thompson",
    role: "Business Owner",
    content: "After a stalking incident, I needed to disappear from people search sites ASAP. footprintiq delivered results faster than I could have done manually. Worth every penny for peace of mind.",
    rating: 5,
    avatar: "MT"
  },
  {
    name: "Lisa Patel",
    role: "HR Manager",
    content: "I recommended footprintiq to our entire executive team. The privacy reports are detailed and easy to understand. It's become an essential tool for anyone who values their digital privacy.",
    rating: 5,
    avatar: "LP"
  },
  {
    name: "David Kim",
    role: "Financial Advisor",
    content: "My clients expect discretion. footprintiq helps me maintain that by keeping my personal information off data broker sites. The ROI is incredible compared to the risk of exposure.",
    rating: 5,
    avatar: "DK"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users say about protecting their digital privacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
