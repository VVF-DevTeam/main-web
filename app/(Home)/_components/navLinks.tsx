import React from "react";
import { navRoutes } from "@/lib/navRoutes";
import NavLink from "./navLink";
import { cn } from "@/lib/utils";

type screenSize = "mobile" | "desktop";
interface NavLinkProps {
  mode: screenSize;
}
const NavLinks = ({ mode }: NavLinkProps) => {
  return (
    <div
      className={cn(
        mode === "desktop"
          ? "w-full h-full flex gap-x-4 items-center"
          : "w-full h-full flex flex-col gap-y-4 items-center justify-center"
      )}
    >
      {navRoutes.map((route) => (
        <NavLink
          key={route.label}
          label={route.label}
          path={route.path}
          logo={route.logo}
          mode= {mode}
        />
      ))}
    </div>
  );
};

export default NavLinks;
