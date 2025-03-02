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

const MobileSidebar = ({ locale }: { locale: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex-center" aria-label="Open mobile menu">
          <Menu className="h-8 w-8 text-textColor transition-all hover:text-textColor-brand" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex-col-center w-[300px] bg-bgColor-black">
        <SheetHeader>
          <SheetTitle className="text-textColor-white">Menu</SheetTitle>

          <SheetDescription>
            <NavLinks mode="mobile" locale={locale} />
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="mt-20">
          <SheetClose asChild>
            <button aria-label="Close mobile menu">
              <X className="text-textColor-brand-light h-12 w-12 rounded-md p-1 hover:border-2 hover:border-bgColor-brand" />
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
