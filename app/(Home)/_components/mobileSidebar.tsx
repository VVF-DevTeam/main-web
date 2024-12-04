import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import NavLinks from "./navLinks";

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center">
          <Menu className="w-8 h-8 text-[#1B171A] hover:w-9 hover:h-9 hover:text-[#620BC4] transition-all" />
        </button>
      </SheetTrigger>
      <SheetContent className="bg-[#1B171A] w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-[#1B171A]">Menu</SheetTitle>

          <SheetDescription>
            <NavLinks mode="mobile" />
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="flex items-center mt-20">
          <SheetClose asChild>
            <button>
              <X className="p-1 rounded-md w-12 h-12 text-[#EFB9A2] hover:border-[#620BC4] hover:border-2 transition-all" />
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
