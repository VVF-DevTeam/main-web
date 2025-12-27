'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
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

interface DeleteJobButtonProps {
  jobId: string
}

const DeleteJobButton = ({ jobId }: DeleteJobButtonProps) => {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await axiosInstance.delete(
        `/api/jobs/delete/${jobId}`
      )
      console.log(response)
      toast.success('Job deleted successfully', {
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
      router.push('/registration/jobs/allJobs')
    } catch (error: any) {
      console.log(error)
      toast.error(error.response?.data || 'Error deleting job', {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'destructive'}>Delete Job</Button>
      </DialogTrigger>
      <DialogContent className="bg-bgColor-white">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription className="text-textColor-black">
            This action cannot be undone. This will permanently delete the job
            and remove all associated data from the server.
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
            {isDeleting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteJobButton



