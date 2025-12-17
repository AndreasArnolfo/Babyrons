export type ServiceType = "bottle" | "sleep" | "med" | "diaper" | "growth" | "meal";

export interface Baby {
  id: string;
  name: string;
  gender?: "male" | "female" | null;
  birthDate?: number | null; // ✅ timestamp
  photo?: string | null;
  color?: string;
  createdAt: number;
}

// 🍼 Nouveau : interface Baby enrichie
export interface ExtendedBaby extends Baby {
  gender?: 'male' | 'female' | null;
  photo: string | null;
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

export interface MealEvent extends BaseEvent {
  type: 'meal';
  foodType: 'vegetable' | 'fruit' | 'protein' | 'starch' | 'dairy' | 'cereal';
  texture?: 'smooth' | 'mashed' | 'pieces';
  amount?: number; // optionally in grams
  note?: string; // name of the food (e.g., "Carrot")
}

export type Event = BottleEvent | SleepEvent | MedEvent | DiaperEvent | GrowthEvent | MealEvent;

export interface AppSettings {
  enabledServices: ServiceType[];
  theme: "light" | "dark" | "pastel";
  themeMode: 'auto' | 'light' | 'dark';
  isPro: boolean;
  notificationsEnabled?: boolean;
}
