import React from 'react';
import { Utensils, Coffee, Bus, ShoppingBag, MoreHorizontal, Mic, MicOff, Check, X, Plus, PieChart, History, ArrowLeft, Loader2, Save, Tag, ChevronLeft, ChevronRight, Calendar, Trash2, Edit, LogOut, Home, Smartphone, Gift, Wallet, Banknote } from 'lucide-react';

export const IconMap: Record<string, React.FC<any>> = {
  Utensils,
  Coffee,
  Bus,
  ShoppingBag,
  MoreHorizontal,
  Mic,
  MicOff,
  Check,
  X,
  Plus,
  PieChart,
  History,
  ArrowLeft,
  Loader2,
  Save,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Edit,
  LogOut,
  Home,
  Smartphone,
  Gift,
  Wallet,
  Banknote
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className, color }) => {
  const IconComponent = IconMap[name] || Tag; // Default to Tag if not found
  return <IconComponent size={size} className={className} color={color} />;
};