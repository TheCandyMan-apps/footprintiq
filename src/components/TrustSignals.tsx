export const TrustSignals = () => {
  const items = [
    "Old usernames",
    "Forgotten accounts",
    "Data broker listings",
    "Breached credentials"
  ];

  return (
    <section className="py-16 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xl md:text-2xl font-medium text-foreground mb-8">
          "Most people don't realise how visible they are online."
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {items.map((item, index) => (
            <span 
              key={index}
              className="px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
        
        <p className="text-lg text-muted-foreground">
          Individually harmless. <span className="text-foreground font-medium">Combined — risky.</span>
        </p>
      </div>
    </section>
  );
};
