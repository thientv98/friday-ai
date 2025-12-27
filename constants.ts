import { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: "FOOD",
    name: "Ăn uống",
    color: "#EF4444", // Red 500
    icon: "Utensils"
  },
  {
    id: "DRINK",
    name: "Cà phê/Nước",
    color: "#F59E0B", // Amber 500
    icon: "Coffee"
  },
  {
    id: "TRANSPORT",
    name: "Di chuyển",
    color: "#3B82F6", // Blue 500
    icon: "Bus"
  },
  {
    id: "SHOPPING",
    name: "Mua sắm",
    color: "#8B5CF6", // Violet 500
    icon: "ShoppingBag"
  },
  // Income Categories (New)
  {
    id: "SALARY",
    name: "Lương",
    color: "#10B981", // Emerald 500
    icon: "Wallet" // Will need to ensure icon exists or map correctly
  },
  {
    id: "INCOME_OTHER",
    name: "Thu nhập khác",
    color: "#059669", // Emerald 600
    icon: "Banknote"
  },
  {
    id: "OTHER",
    name: "Khác",
    color: "#6B7280", // Gray 500
    icon: "MoreHorizontal"
  }
];

export const SAMPLE_PROMPTS = [
  "Sáng ăn phở 40k, cà phê 25k",
  "Lương về 15 triệu, thưởng nóng 2 triệu",
  "Đổ xăng 50k, mẹ cho 500k tiêu vặt",
  "Bán đồ cũ được 200k"
];