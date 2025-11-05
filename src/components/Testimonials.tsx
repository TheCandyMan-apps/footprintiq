import { Star, Quote, Sparkles } from "lucide-react";
import testimonialsBg from "@/assets/testimonials-bg.jpg";
import { useParallax } from "@/hooks/useParallax";
import { useRef } from "react";

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
  const bgRef = useRef<HTMLImageElement>(null);
  const bgParallax = useParallax(bgRef, { speed: 0.2, direction: 'down' });
  
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Animated Background with Parallax */}
      <div className="absolute inset-0 z-0">
        <img 
          ref={bgRef}
          src={testimonialsBg} 
          alt="Network of trust" 
          className="w-full h-full object-cover opacity-20"
          style={{ 
            transform: bgParallax.transform,
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background/95 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">5,000+ Happy Users</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
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
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow hover:-translate-y-2"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity" />
              
              <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20 group-hover:text-primary/30 group-hover:scale-110 transition-all" />
              
              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center font-bold text-lg shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />
                ))}
              </div>

              <p className="relative text-sm text-muted-foreground leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
