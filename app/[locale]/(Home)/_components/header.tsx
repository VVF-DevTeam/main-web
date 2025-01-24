'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Phone, Mail, Copy, Globe } from 'lucide-react'
import LanguageChanger from '@/components/translator/LanguageChanger'
import React from 'react'

const Header = () => {
  const { toast } = useToast()

  const handleClick = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
    });
  };

  return (
    <div className="flex h-[60px] w-full flex-col items-center gap-x-10 bg-[#620BC4] px-8 text-slate-300 sm:flex-row">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-x-2 hover:text-[#EFB9A2] focus:outline-none focus:ring-2 focus:ring-[#EFB9A2] focus:ring-offset-2 rounded-md p-1"
              onClick={() => handleClick("+1 (778) 583-7088")}
              aria-label="Copy phone number to clipboard"
            >
              <Phone className="h-5 w-5" />
              <span>{"+1 (778) 583-7088"}</span>
            </button>
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
          <TooltipTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-x-2 hover:text-[#EFB9A2] focus:outline-none focus:ring-2 focus:ring-[#EFB9A2] focus:ring-offset-2 rounded-md p-1"
              onClick={() => handleClick("media@vietvibe.org")}
              aria-label="Copy email address to clipboard"
            >
              <Mail className="h-5 w-5" /> <span>media@vietvibe.org</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1B171A]">
            <p className="flex gap-x-2 text-sm text-[#EFB9A2]">
              Copy
              <Copy className="h-4 w-4" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* LanguageChanger: Top-Right Corner */}
      <div className="absolute right-6 top-2 flex items-center gap-x-2 rounded-md px-2 py-1">
        <Globe className="h-5 w-5 text-[#f7f0f0]" />
        <LanguageChanger />
      </div>
    </div>
  )
}

export default Header
