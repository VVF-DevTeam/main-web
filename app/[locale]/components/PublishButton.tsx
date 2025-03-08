'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
interface PublishButtonProps {
  id: string
  canPublish: boolean
  isPublished: boolean
  type: 'post' | 'event' | 'class'
  domain: 'posts' | 'events' | 'classes'
}
// TODO: Add the types to a different file.
const PublishButton = ({
  id,
  canPublish,
  isPublished,
  type,
  domain,
}: PublishButtonProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const action = isPublished ? 'Unpublish' : 'Publish'

  const publishOrUnpublish = async (action: 'Unpublish' | 'Publish') => {
    try {
      await axios.patch(`/api/${domain}/${action.toLowerCase()}/${id}`)
      toast({
        variant: 'default',
        title: 'Success',
        description: `Successfully published ${type}`,
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Error publishing ${type}`,
      })
    }
  }
  return (
    <Button
      onClick={() => publishOrUnpublish(action)}
      variant={'black'}
      disabled={!canPublish}
    >
      {action}
    </Button>
  )
}

export default PublishButton
