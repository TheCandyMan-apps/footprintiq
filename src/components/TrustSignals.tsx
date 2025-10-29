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
        {/* Trust Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo-icon.png" 
              alt="FootprintIQ Shield" 
              className="w-16 h-16 animate-float"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Trusted by Privacy-Conscious Users</h2>
          <p className="text-muted-foreground">Join thousands protecting their digital identity</p>
        </div>
        
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