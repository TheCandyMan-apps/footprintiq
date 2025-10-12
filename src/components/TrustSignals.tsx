import { Shield, Users, TrendingUp, Award } from "lucide-react";

const stats = [
  {
    icon: <Users className="w-8 h-8" />,
    value: "50,000+",
    label: "Users Protected"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    value: "2M+",
    label: "Data Points Removed"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    value: "100+",
    label: "Data Brokers Covered"
  },
  {
    icon: <Award className="w-8 h-8" />,
    value: "4.8/5",
    label: "User Rating"
  }
];

export const TrustSignals = () => {
  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};