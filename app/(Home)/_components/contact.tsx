import React from "react";
import CompanyLogo from "@/lib/companyLogo";
import { Contact2 } from "lucide-react";
const Contact = () => {
  return (
    <div className="w-full bg-[#1B171A]/50 h-[50vh]">
      <div className="flex flex-col w-full h-full items-center justify-center gap-y-20 p-12">
        <div className="flex flex-col items-center justify-center gap-y-6">
          <h2 className="text-5xl tracking- text-center font-bold text-[#EFB9A2] hover:text-[#EFB9A2]/70 transition-all duration-100 ease-out cursor-default">
            GET IN TOUCH WITH US
          </h2>
          <p className="text-[#1B171A] text-2xl">
            Placeholder text for the org to fill
          </p>
        </div>
        <CompanyLogo height={190} width={190} />
        <button className="bg-[#1B171A] tracking-wide font-bold rounded-md border-b-2 border-[#EFB9A2] hover:border-[#EFB9A2]/80 hover:bg-[#1B171A]/90 hover:text-white shadow-md py-6 px-14 inline-flex items-center">
          <span className="text-[#EFB9A2] mx-auto flex items-center gap-x-4">
            Contact Us
            <Contact2 className="w-7 h-7" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Contact;
