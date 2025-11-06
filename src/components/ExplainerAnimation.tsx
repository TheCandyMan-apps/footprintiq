import { useState, useEffect } from 'react';
import { Search, Globe, Shield, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "1. Enter Your Info",
    description: "Type your name, email, or phone number",
    color: "text-blue-500"
  },
  {
    icon: Globe,
    title: "2. We Search Everywhere",
    description: "We scan hundreds of websites automatically",
    color: "text-purple-500"
  },
  {
    icon: Shield,
    title: "3. See What's Exposed",
    description: "Get a clear report of your exposed information",
    color: "text-orange-500"
  },
  {
    icon: CheckCircle2,
    title: "4. Remove It Instantly",
    description: "Click to remove your data and stay protected",
    color: "text-green-500"
  }
];

export const ExplainerAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto py-12 sm:py-16 md:py-20 px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
        How It Works
      </h2>
      <p className="text-base sm:text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Protecting your privacy is simple and takes just minutes
      </p>

      {/* Animation Container */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isPast = index < activeStep;

          return (
            <div
              key={index}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-500
                ${isActive 
                  ? 'border-primary bg-primary/5 scale-105 shadow-lg shadow-primary/20' 
                  : isPast 
                  ? 'border-primary/30 bg-primary/5 opacity-60'
                  : 'border-border bg-card opacity-40'
                }
              `}
            >
              {/* Step Icon */}
              <div 
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto
                  transition-all duration-500
                  ${isActive 
                    ? 'bg-primary text-primary-foreground scale-110 animate-pulse' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                <Icon className="w-8 h-8" />
              </div>

              {/* Step Content */}
              <h3 className={`
                text-lg font-semibold mb-2 text-center transition-colors duration-300
                ${isActive ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {step.title}
              </h3>
              <p className={`
                text-sm text-center transition-colors duration-300
                ${isActive ? 'text-foreground/80' : 'text-muted-foreground/60'}
              `}>
                {step.description}
              </p>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                </div>
              )}

              {/* Connection Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-8 w-16 h-0.5">
                  <div 
                    className={`
                      h-full transition-all duration-500
                      ${isPast || isActive 
                        ? 'bg-primary' 
                        : 'bg-border'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === activeStep 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }
            `}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Subtext */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        No technical knowledge required • Takes less than 5 minutes • 100% secure
      </p>
    </div>
  );
};
