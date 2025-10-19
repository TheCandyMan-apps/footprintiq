export interface PartnerTier {
  name: string;
  minClients: number;
  maxClients?: number;
  commission: number;
  benefits: string[];
}

export const PARTNER_TIERS: PartnerTier[] = [
  {
    name: "Affiliate",
    minClients: 0,
    maxClients: 5,
    commission: 10,
    benefits: [
      "10% commission on referrals",
      "Marketing materials access",
      "Monthly newsletter",
      "Referral tracking dashboard"
    ]
  },
  {
    name: "Certified Reseller",
    minClients: 6,
    maxClients: 50,
    commission: 20,
    benefits: [
      "20% commission on referrals",
      "Priority support",
      "Co-marketing opportunities",
      "Training & certification",
      "Custom referral links"
    ]
  },
  {
    name: "Strategic Partner",
    minClients: 51,
    commission: 30,
    benefits: [
      "Custom revenue share agreement",
      "Dedicated account manager",
      "White-label options",
      "API access",
      "SLA guarantees",
      "Joint business planning"
    ]
  }
];

export const calculateCommission = (clientCount: number, revenue: number): number => {
  const tier = PARTNER_TIERS.find(
    t => clientCount >= t.minClients && (!t.maxClients || clientCount <= t.maxClients)
  );
  
  if (!tier) return 0;
  return (revenue * tier.commission) / 100;
};

export const getPartnerTier = (clientCount: number): PartnerTier => {
  return PARTNER_TIERS.find(
    t => clientCount >= t.minClients && (!t.maxClients || clientCount <= t.maxClients)
  ) || PARTNER_TIERS[0];
};
