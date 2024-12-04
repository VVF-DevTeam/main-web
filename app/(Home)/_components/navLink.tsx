"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, LucideIcon } from "lucide-react";

const navLogos: Record<string, LucideIcon> = {
  home: Home,
  events: CalendarDays,
};
type screenSize = "mobile" | "desktop";
interface NavLinkProps {
  label: string;
  path: string;
  logo: string;
  mode: screenSize;
}
const NavLink: React.FC<NavLinkProps> = ({ label, path, logo, mode }) => {
  const Icon = navLogos[logo];
  return (
    <Link
      href={path}
      className={cn(
        mode === "desktop"
          ? "flex gap-x-2 justify-center items-center text-[#1B171A] hover:text-[#1B171A]/70 transition-all"
          : "w-full h-full p-4 flex gap-x-4 rounded-md mt-2 text-xl justify-center items-center text-slate-200 hover:text-[#EFB9A2] hover:bg-[#620BC4] transition-all"
      )}
    >
      <Icon className="w-6 h-6" />
      <span>{label}</span>
    </Link>
  );
};

export default NavLink;
