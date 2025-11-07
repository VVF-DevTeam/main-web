'use client'
//  Libraries
import React from 'react'
import { ArrowBigLeft } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Interfaces & Types
interface JobButtonProps {
  jobKeyName: string
}

// Component
const JobButton = ({ jobKeyName }: JobButtonProps) => {

  return (
    <Link href={`/registration/jobs/${jobKeyName}`}>
      <Button
        size={'sm'}
        className="all ease text-pretty border-2 border-bgColor-brand900 bg-slate-100 text-sm font-bold text-textColor-brand900 transition hover:bg-bgColor-brand600 hover:text-slate-50 py-5"
      >
        More <ArrowBigLeft className="h-4 w-4 rotate-180 fill-bgColor-brand900" />
      </Button>
    </Link>
  )
}

export default JobButton
