import React from 'react'
import { navRoutes } from '@/lib/navRoutes'
import Link from 'next/link'

import { Separator } from '@radix-ui/react-separator'
const Footer = () => {
  return (
    <footer className="w-full">
      <div className="bg-[#1B171A] px-12 py-6 md:px-16 lg:px-24">
        <div className="grid h-full grid-cols-2">
          {/* Column 1 */}
          <div className="h-full w-full">
            <div className="pl-6">
              <h5 className="py-2 text-xl text-slate-400">Pages</h5>
              <Separator className="h-[2px] w-1/4 bg-slate-700" />
              <div className="mt-4 flex flex-col gap-y-2">
                {navRoutes.map((route, index) => (
                  <Link
                    key={index}
                    href={route.path}
                    className="text-slate-300 hover:text-[#EFB9A2]"
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Column 2 */}
          <div>
            <div className="h-full w-full">
              <div className="px-6">
                <h5 className="py-2 text-xl text-slate-400">Contact us</h5>
                <Separator className="h-[2px] w-1/4 bg-slate-700" />
                <div className="mt-4 flex flex-col gap-y-2 text-sm">
                  <p className="text-slate-300">Name of Org</p>
                  <p className="text-slate-500">
                    <span className="text-slate-300">Phone Hours:</span>{' '}
                    placeholder
                  </p>
                  <p className="text-slate-500">
                    <span className="text-slate-300">Phone Number:</span>{' '}
                    placeholder
                  </p>
                  <p className="text-slate-500">
                    <span className="text-slate-300">Email:</span>placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
