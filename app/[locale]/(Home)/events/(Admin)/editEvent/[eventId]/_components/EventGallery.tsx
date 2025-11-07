'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Event } from '@prisma/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Image from 'next/image'

interface EventGalleryProps {
  event: Event
}

// Helper: Validate URL and check if it's a Google Drive image file link
function getValidImageUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return null
  }

  // Only accept Google Drive file links
  if (parsedUrl.hostname === 'drive.google.com') {
    // File link
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileMatch[1]}`
    }
    // Thumbnail link
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/)
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}`
    }
    // Folder link (not supported)
    if (url.includes('/folders/')) {
      return null
    }
  }
  // Not a Google Drive file link
  return null
}

const EventGallery = ({ event }: EventGalleryProps) => {
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [galleryImages, setGalleryImages] = useState<string[]>(
    (event.imgUrls as string[]) || []
  )

  const handleAddImage = () => {
    setGalleryImages([...galleryImages, ''])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...galleryImages]
    newImages.splice(index, 1)
    setGalleryImages(newImages)
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...galleryImages]
    newImages[index] = value
    setGalleryImages(newImages)
  }

  const handleSubmit = async () => {
    try {
      // Filter out empty image URLs and convert to valid Google Drive URLs
      const completeImages = galleryImages
        .map((url) => getValidImageUrl(url))
        .filter((url): url is string => !!url)

      // Prevent saving if any URL is not a valid Google Drive file link
      const invalidUrls = galleryImages.filter((url) => !getValidImageUrl(url))
      if (invalidUrls.length > 0) {
        toast.error('Only Google Drive image file URLs are accepted.', {
          description: (
            <span>
              Please use a link like:
              <br />
              <span className="font-mono text-xs">
                https://drive.google.com/file/d/FILE_ID/view?usp=sharing
              </span>
            </span>
          ),
        })
        return
      }

      await axiosInstance.put(`/api/events/edit/${event.id}`, {
        imgUrls: completeImages,
      })
      toast.success('Gallery images updated successfully', {
        description: (
          <span className="text-muted-foreground">{currentDateTime}</span>
        ),
        style: {
          color: 'hsl(var(--text-green))', // Using CSS variable for green
        },
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Failed to update gallery images', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
            </span>
            <span className="text-muted-foreground">{currentDateTime}</span>
          </div>
        ),
        style: {
          color: 'hsl(var(--text-red))', // Using CSS variable for red
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-bgColor-gray300 px-4 py-6">
      <div className="flex flex-col gap-y-4">
        {/* Notification for Google Drive only */}
        <div className="mb-2 rounded border border-textColor-yellow px-3 py-2 text-sm">
          Only Google Drive image file URLs are accepted. Please use links
          like:
          <br />
          <span className="font-mono text-xs">
            https://drive.google.com/file/d/FILE_ID/view?usp=sharing, or
            <br/> 
            https://drive.google.com/thumbnail?id=FILE_ID (refer above)
          </span>
        </div>
        {galleryImages.map((imageUrl, index) => (
          <div key={index} className="flex items-end gap-x-4">
            <div className="flex-1">
              <Label>Image URL {index + 1}</Label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="Enter Google Drive image file URL"
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => handleRemoveImage(index)}
              className="mb-[2px]"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      {galleryImages.filter((url) => url.trim() !== '').length > 0 && (
        <div className="mt-6">
          <Label className="text-base font-semibold">Preview</Label>
          <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {galleryImages
              .filter((url) => url.trim() !== '')
              .map((imageUrl, index) => {
                const validUrl = getValidImageUrl(imageUrl)
                return (
                  <div
                    key={index}
                    className="relative flex aspect-square items-center justify-center rounded-md bg-bgColor-gray300"
                  >
                    {validUrl ? (
                      <Image
                        src={validUrl}
                        alt={`Gallery Image ${index + 1}`}
                        fill
                        sizes="md:75vw 90vw"
                        className="z-0 rounded-sm object-cover"
                        onError={(e) => {
                          // Optionally, you can set a state to show error for this image
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-center text-xs text-textColor-red">
                        Invalid image URL
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="flex gap-x-4">
        <Button onClick={handleAddImage} variant="outline">
          Add Gallery Image
        </Button>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </div>
    </div>
  )
}

export default EventGallery
