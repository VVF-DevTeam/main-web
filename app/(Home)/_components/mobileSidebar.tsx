import { Menu, X } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import NavLinks from './navLinks'

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center">
          <Menu className="h-8 w-8 text-[#1B171A] transition-all hover:h-9 hover:w-9 hover:text-[#620BC4]" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[300px] bg-[#1B171A]">
        <SheetHeader>
          <SheetTitle className="text-[#1B171A]">Menu</SheetTitle>

          <SheetDescription>
            <NavLinks mode="mobile" />
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="mt-20 flex items-center">
          <SheetClose asChild>
            <button>
              <X className="h-12 w-12 rounded-md p-1 text-[#EFB9A2] transition-all hover:border-2 hover:border-[#620BC4]" />
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
