'use client'

import { useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Event } from '@prisma/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { getValidGoogleDriveImageUrl } from '@/lib/utilFunctions/gdrive-loader'
import { ImageUploadButton } from '@/components/button/ImageUploadButton'
import Image from 'next/image'
import Loader from '@/components/loader/Loader'

interface EventGalleryProps {
  event: Event
}

const EventGallery = ({ event }: EventGalleryProps) => {
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)
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
      setIsLoading(true)
      // Filter out empty image URLs and convert to valid Google Drive URLs
      const completeImages = galleryImages
        .map((url) => getValidGoogleDriveImageUrl(url))
        .filter((url): url is string => !!url)

      // Prevent saving if any URL is not a valid Google Drive file link
      const invalidUrls = galleryImages.filter((url) => !getValidGoogleDriveImageUrl(url))
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
        style: { color: '#22c55e' },
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
        style: { color: '#ef4444' },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGalleryImageUpload =
    (index: number) => async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return

      setIsLoading(true)
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axiosInstance.post(
          '/api/events/gallery/images',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        if (response.status === 200) {
          const url =
            getValidGoogleDriveImageUrl(response.data.url) ??
            response.data.url
          setGalleryImages((prev) => {
            const next = [...prev]
            next[index] = url
            return next
          })
          toast.success('Image uploaded successfully', {
            description: (
              <span className="text-muted-foreground">{currentDateTime}</span>
            ),
            style: { color: '#22c55e' },
          })
        } else {
          toast.error('Failed to upload image', {
            description: (
              <span className="text-muted-foreground">{currentDateTime}</span>
            ),
            style: { color: '#ef4444' },
          })
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image', {
          description: (
            <span className="text-muted-foreground">{currentDateTime}</span>
          ),
          style: { color: '#ef4444' },
        })
      } finally {
        setIsLoading(false)
        e.target.value = ''
      }
    }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex flex-col gap-y-4">
          {/* Notification for Google Drive only */}
          <div className="mb-2 rounded border border-textColor-yellow px-3 py-2 text-sm">
            Only Google Drive image file URLs are accepted. Please use links
            like:
            <br />
            <span className="font-mono text-xs">
              https://drive.google.com/file/d/FILE_ID/view?usp=sharing, or
              <br />
              https://drive.google.com/thumbnail?id=FILE_ID (refer above on how to get image id)
            </span> <br />
            Please upload them to Google Drive {' '}
            <a
              className="text-blue-700 underline"
              href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>.
          </div>
          {galleryImages.map((imageUrl, index) => (
            <div key={index} className="flex items-end gap-x-1">
              <div className="flex-1">
                <Label>Image URL {index + 1}</Label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Enter Google Drive image file URL"
                />
              </div>
              <div className="mb-[2px] shrink-0">
                <ImageUploadButton
                  onChange={handleGalleryImageUpload(index)}
                  disabled={isLoading}
                >
                  Upload
                </ImageUploadButton>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleRemoveImage(index)}
                disabled={isLoading}
                className="mb-[2px] shrink-0"
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
                  const validUrl = getValidGoogleDriveImageUrl(imageUrl)
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
          <Button onClick={handleAddImage} variant="outline" disabled={isLoading}>
            Add Gallery Image
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>Save Changes</Button>
        </div>
      </div>
    </>
  )
}

export default EventGallery
