import { LucideIcon } from "lucide-react";
import React from "react";

interface GridCardProps {
  name: string;
  desc: string;
  logo: LucideIcon;
}
const GridCard = ({ name, desc, logo: Logo }: GridCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 md:gap-y-6 p-6">
      <Logo className="w-12 h-12 text-[#B83AB3]/70" />
      <h2 className="text-3xl font-bold text-[#1B171A]/80">{name}</h2>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
};

export default GridCard;
