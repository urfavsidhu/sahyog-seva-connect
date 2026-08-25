import {
  ChefHat,
  GraduationCap,
  Hammer,
  PaintRoller,
  Sparkles,
  Sprout,
  Wind,
  Wrench,
  Zap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Wrench,
  Zap,
  Sparkles,
  ChefHat,
  GraduationCap,
  Hammer,
  PaintRoller,
  Wind,
  Sprout,
};

export const categoryIcon = (name: string): LucideIcon => map[name] ?? Briefcase;
