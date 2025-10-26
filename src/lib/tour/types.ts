export interface TourStep {
  id: string;
  sel: string; // CSS selector to highlight
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
  role?: "analyst" | "admin" | "free";
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
}

export type TourId = "search" | "results" | "graph" | "monitor" | "admin" | "reports" | "onboarding";
