'use client'
// Libraries
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ApplicationForm from './ApplicationForm'
import { X } from 'lucide-react'

// Interfaces and Types
import { JobType } from '@prisma/client'
interface JobApplyModalProps {
  id: string
  keyName: string
  author: string
  title: string
  jobType: JobType
}

// Main Component
const JobApplyModal = ({
  id,
  keyName,
  author,
  title,
  jobType,
}: JobApplyModalProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('job')

  // state to show modal
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  return (
    <div>
      {/* Apply Button */}
      {author ? <Button onClick={openModal}>{t('apply-button')}</Button> : "Please log in to apply for this job"}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="scrollbar-thumb-rounded-full h-[80%] w-[80%] overflow-x-clip bg-bgColor pt-0">
          <DialogHeader className="sticky top-0 -mx-8 overflow-x-visible border-b-2 border-bgColor-black bg-bgColor px-6 pt-6 rounded-t-3xl">
            <DialogTitle className="mb-5">
              Application Form for {title}
            </DialogTitle>
            <DialogClose className="ring-offset-background absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <DialogDescription className='overflow-x-clip overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent hover:scrollbar-thumb-gray-400'>
            <ApplicationForm author={author} id={id} keyName={keyName} jobType={jobType} />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default JobApplyModal
