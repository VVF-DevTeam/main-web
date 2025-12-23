// Components
import { Menu, X } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import NavLinks from './navLinks'

// Main Component
const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex-center" aria-label="Open mobile menu">
          <Menu className="h-8 w-8 text-textColor transition-all hover:text-textColor-brand900" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex-col-center w-[300px] overflow-x-hidden bg-bgColor-black">
        <SheetHeader>
          <SheetTitle className="text-center text-2xl font-bold text-textColor-white">
            Menu
          </SheetTitle>

          <NavLinks mode="mobile" />
        </SheetHeader>
        <SheetFooter className="mt-0">
          <SheetClose asChild>
            <button aria-label="Close mobile menu">
              <X className="hover:border-bgColor-brandLight h-12 w-12 rounded-md p-1 text-textColor-white hover:border-2" />
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
