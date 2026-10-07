import React from "react";
import {
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Home,
  Wifi,
  Film,
  Plane,
  Laptop,
  Dumbbell,
  GraduationCap,
  Shield,
  PiggyBank,
  Sparkles,
} from "lucide-react";

export interface BudgetIconStyle {
  icon: React.ReactNode;
  bg: string;
}

export function getBudgetIconData(name: string, type?: string): BudgetIconStyle {
  const n = (name || "").toLowerCase();

  // Makan, Minum, Dapur, Sembako
  if (
    n.includes("makan") ||
    n.includes("food") ||
    n.includes("dapur") ||
    n.includes("pasar") ||
    n.includes("grocer")
  ) {
    return {
      icon: <Utensils size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    };
  }

  // Kopi, Cafe, Jajan, Cemilan
  if (
    n.includes("kopi") ||
    n.includes("coffee") ||
    n.includes("jajan") ||
    n.includes("snack") ||
    n.includes("cafe")
  ) {
    return {
      icon: <Coffee size={18} className="text-amber-700" />,
      bg: "bg-amber-50",
    };
  }

  // Transportasi, Bensin, Ojol, Kendaraan
  if (
    n.includes("transport") ||
    n.includes("bensin") ||
    n.includes("bbm") ||
    n.includes("ojol") ||
    n.includes("parkir") ||
    n.includes("motor") ||
    n.includes("mobil")
  ) {
    return {
      icon: <Car size={18} className="text-blue-700" />,
      bg: "bg-blue-50",
    };
  }

  // Belanja, Shopping, Pakaian, Skincare
  if (
    n.includes("belanja") ||
    n.includes("shop") ||
    n.includes("baju") ||
    n.includes("skincare")
  ) {
    return {
      icon: <ShoppingBag size={18} className="text-pink-700" />,
      bg: "bg-pink-50",
    };
  }

  // Rumah, Kost, Kontrakan, Listrik, Air
  if (
    n.includes("kost") ||
    n.includes("sewa") ||
    n.includes("rumah") ||
    n.includes("listrik") ||
    n.includes("pdam") ||
    n.includes("tagihan")
  ) {
    return {
      icon: <Home size={18} className="text-orange-700" />,
      bg: "bg-orange-50",
    };
  }

  // Internet, Kuota, Wifi, Pulsa
  if (
    n.includes("internet") ||
    n.includes("wifi") ||
    n.includes("pulsa") ||
    n.includes("kuota")
  ) {
    return {
      icon: <Wifi size={18} className="text-cyan-700" />,
      bg: "bg-cyan-50",
    };
  }

  // Hiburan, Bioskop, Netflix, Game
  if (
    n.includes("hiburan") ||
    n.includes("nonton") ||
    n.includes("game") ||
    n.includes("film") ||
    n.includes("netflix") ||
    n.includes("bioskop")
  ) {
    return {
      icon: <Film size={18} className="text-violet-700" />,
      bg: "bg-violet-50",
    };
  }

  // Traveling, Liburan, Healing, Tiket
  if (
    n.includes("liburan") ||
    n.includes("travel") ||
    n.includes("vacation") ||
    n.includes("healing") ||
    n.includes("tiket") ||
    n.includes("hotel")
  ) {
    return {
      icon: <Plane size={18} className="text-sky-700" />,
      bg: "bg-sky-50",
    };
  }

  // Laptop, Gadget, Elektronik, HP
  if (
    n.includes("gadget") ||
    n.includes("laptop") ||
    n.includes("hp") ||
    n.includes("elektronik")
  ) {
    return {
      icon: <Laptop size={18} className="text-indigo-700" />,
      bg: "bg-indigo-50",
    };
  }

  // Olahraga, Gym, Fitness, Obat
  if (
    n.includes("sehat") ||
    n.includes("obat") ||
    n.includes("dokter") ||
    n.includes("gym") ||
    n.includes("fitness")
  ) {
    return {
      icon: <Dumbbell size={18} className="text-teal-700" />,
      bg: "bg-teal-50",
    };
  }

  // Buku, Pendidikan, Kursus, Sekolah
  if (
    n.includes("buku") ||
    n.includes("kursus") ||
    n.includes("kuliah") ||
    n.includes("belajar") ||
    n.includes("sekolah")
  ) {
    return {
      icon: <GraduationCap size={18} className="text-yellow-700" />,
      bg: "bg-yellow-50",
    };
  }

  // Dana Darurat & Asuransi
  if (
    n.includes("darurat") ||
    n.includes("emergency") ||
    n.includes("asuransi")
  ) {
    return {
      icon: <Shield size={18} className="text-rose-700" />,
      bg: "bg-rose-50",
    };
  }

  // Tabungan / Investasi
  if (
    type === "SAVING" ||
    n.includes("tabung") ||
    n.includes("invest") ||
    n.includes("saving")
  ) {
    return {
      icon: <PiggyBank size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    };
  }

  // Default Fallback
  return {
    icon: <Sparkles size={18} className="text-[#062828]" />,
    bg: "bg-[#FEF08A]/60",
  };
}