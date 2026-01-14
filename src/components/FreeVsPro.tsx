import { Link } from "react-router-dom";

export const FreeVsPro = () => {
  return (
    <section className="py-16 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-lg md:text-xl text-foreground leading-relaxed">
          <span className="font-semibold">Free scans</span>{" "}
          <span className="text-muted-foreground">show where exposure exists.</span>
          <br className="hidden sm:block" />{" "}
          <span className="font-semibold">Pro scans</span>{" "}
          <span className="text-muted-foreground">explain how identifiers connect and provide evidence for removal.</span>
        </p>
        <Link 
          to="/pricing" 
          className="inline-block mt-6 text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          Learn more about Pro
        </Link>
      </div>
    </section>
  );
};
