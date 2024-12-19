'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

import { Phone, Mail, Copy } from 'lucide-react'
const Header = () => {
  const { toast } = useToast()
  return (
    <div className="flex h-[60px] w-full flex-col items-center gap-x-10 bg-[#620BC4] px-8 text-slate-300 sm:flex-row">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className="group flex items-center gap-x-2 hover:text-[#EFB9A2]"
              onClick={() => {
                navigator.clipboard.writeText('+1 (123) 456-7890')
                toast({
                  title: 'Copied to clipboard',
                })
              }}
            >
              <Phone className="h-5 w-5" /> <span>+1 (123) 456-7890</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1B171A]">
            <p className="flex gap-x-2 text-sm text-[#EFB9A2]">
              Copy
              <Copy className="h-4 w-4" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className="group flex items-center gap-x-2 hover:text-[#EFB9A2]"
              onClick={() => {
                navigator.clipboard.writeText('randomemail@gmail.com')
                toast({
                  title: 'Copied to clipboard',
                })
              }}
            >
              <Mail className="h-5 w-5" /> <span>randomemail@gmail.com</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1B171A]">
            <p className="flex gap-x-2 text-sm text-[#EFB9A2]">
              Copy
              <Copy className="h-4 w-4" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default Header
