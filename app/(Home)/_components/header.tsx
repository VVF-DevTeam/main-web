"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast"

import { Phone, Mail, Copy } from "lucide-react";
const Header = () => {
  const { toast } = useToast();
  return (
    <div className="w-full gap-x-10 flex flex-col sm:flex-row items-center text-slate-300 bg-[#620BC4] h-[60px] px-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className="group hover:text-[#EFB9A2] flex gap-x-2 items-center"
              onClick={() => {
                navigator.clipboard.writeText("+1 (123) 456-7890");
                toast({
                  title: "Copied to clipboard",
                });
              }}
            >
              <Phone className="w-5 h-5 " /> <span>+1 (123) 456-7890</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1B171A]">
            <p className=" text-[#EFB9A2] text-sm flex gap-x-2">
              Copy
              <Copy className="w-4 h-4" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className="group hover:text-[#EFB9A2] flex gap-x-2 items-center"
              onClick={() => {
                navigator.clipboard.writeText("randomemail@gmail.com");
                toast({
                  title: "Copied to clipboard",
                });
              }}
            >
              <Mail className="w-5 h-5 " /> <span>randomemail@gmail.com</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1B171A]">
            <p className=" text-[#EFB9A2] text-sm flex gap-x-2">
              Copy
              <Copy className="w-4 h-4" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Header;
