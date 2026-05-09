'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DeletePostButtonProps {
  postId: string
  isSuperAdmin: boolean
}

const DeletePostButton = ({ postId, isSuperAdmin }: DeletePostButtonProps) => {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const deniedMessage =
    'Only Super Admin have delete permission, please contact Director of IT department (Khai) or any other Director'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await axiosInstance.delete(
        `/api/posts/delete/${postId}`
      )
      console.log(response)
      toast.success('Post deleted successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      setOpen(false)
      router.push('/posts/allPosts')
    } catch (error) {
      console.log(error)
      toast.error('Error deleting post', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again later.'}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {isDeleting && <Loader />}
      {!isSuperAdmin ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-block cursor-not-allowed"
                onClick={() => toast.info(deniedMessage)}
              >
                <Button
                  variant={'destructive'}
                  disabled
                  className="pointer-events-none"
                >
                  Delete Post
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-bgColor-black">
              <p className="text-sm text-textColor-brand600">{deniedMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={'destructive'}>Delete Post</Button>
          </DialogTrigger>
          <DialogContent className="bg-bgColor-white">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription className="text-textColor-black">
                This action cannot be undone. This will permanently delete the
                post and remove all associated data from the server.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default DeletePostButton

