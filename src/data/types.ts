export type ServiceType = "bottle" | "sleep" | "med" | "diaper" | "growth";

export interface Baby {
  id: string;
  name: string;
  color: string;
  photoUrl?: string;
  createdAt: number;
}

export interface BaseEvent {
  id: string;
  babyId: string;
  type: ServiceType;
  at: number;
  createdBy: string;
}

export interface BottleEvent extends BaseEvent {
  type: "bottle";
  ml: number;
  kind?: "breastmilk" | "formula" | "mixed";
}

export interface SleepEvent extends BaseEvent {
  type: "sleep";
  startAt: number;
  endAt?: number;
  duration?: number;
}

export interface MedEvent extends BaseEvent {
  type: "med";
  name: string;
  dose?: string;
  note?: string;
}

export interface DiaperEvent extends BaseEvent {
  type: "diaper";
  kind: "wet" | "dirty" | "both";
}

export interface GrowthEvent extends BaseEvent {
  type: "growth";
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
}

export type Event = BottleEvent | SleepEvent | MedEvent | DiaperEvent | GrowthEvent;

export interface AppSettings {
  enabledServices: ServiceType[];
  theme: "light" | "dark" | "pastel";
  isPro: boolean;
}
