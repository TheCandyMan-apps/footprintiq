import { Shield, Users, TrendingUp, Award } from "lucide-react";

const stats = [
  {
    icon: <Users className="w-6 h-6" />,
    value: "50,000+",
    label: "Users Protected"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    value: "2M+",
    label: "Data Points Removed"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    value: "100+",
    label: "Data Brokers Covered"
  },
  {
    icon: <Award className="w-6 h-6" />,
    value: "4.8/5",
    label: "User Rating"
  }
];

export const TrustSignals = () => {
  return (
    <section className="py-16 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-6xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
