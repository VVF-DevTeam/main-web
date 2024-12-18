import React from "react";
import SignInForm from "../_components/SignInForm";
import Image from "next/image";
function signInPage() {
  return (
    <div className="min-h-screen h-full flex px-12 py-40 lg:px-24 xl:px-48 bg-[#1B171A]/50 mt-auto">
      <div className="w-full max-w-7xl h-full max-h-9xl mx-auto bg-white/95 shadow-md flex flex-col md:flex-row rounded-md">
        <div className="hidden md:block basis-[55%] shrink-0 relative">
          <Image
            src="/sample-images/image4.jpg"
            alt="Org image"
            fill
            className="object-cover rounded-md"
          />
        </div>
        <SignInForm />
      </div>
    </div>
  );
}

export default signInPage;
