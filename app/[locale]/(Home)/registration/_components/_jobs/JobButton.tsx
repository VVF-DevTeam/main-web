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
        className="all ease text-pretty border-2 border-bgColor-brand bg-slate-100 text-sm font-bold text-bgColor-brand transition hover:bg-bgColor-brand/80 hover:text-slate-50 py-5"
      >
        More <ArrowBigLeft className="h-4 w-4 rotate-180 fill-bgColor-brand" />
      </Button>
    </Link>
  )
}

export default JobButton
