'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

interface PublishButtonProps {
  id: string
  canPublish: boolean
  isPublished: boolean
  type: 'post' | 'event' | 'class' | 'job'
  domain: 'posts' | 'events' | 'classes' | 'jobs'
}

const PublishButton = ({
  id,
  canPublish,
  isPublished,
  type,
  domain,
}: PublishButtonProps) => {
  const router = useRouter()
  const action = isPublished ? 'Unpublish' : 'Publish'
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)

  const publishOrUnpublish = async (action: 'Unpublish' | 'Publish') => {
    try {
      setIsLoading(true)
      await axiosInstance.patch(`/api/${domain}/${action.toLowerCase()}/${id}`)
      toast.success(`Successfully ${action.toLowerCase()}ed ${type}`, {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error(`Error ${action.toLowerCase()}ing ${type}`, { 
        description: (
          <div className="flex flex-col gap-1">
            <span>Please try again later</span>
            <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      {isLoading && <Loader />}
      <Button
        onClick={() => publishOrUnpublish(action)}
        variant={'black'}
        disabled={!canPublish || isLoading}
      >
        {action}
      </Button>
    </>
  )
}

export default PublishButton
