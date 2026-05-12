'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Event } from '@prisma/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

interface EventSocialMediaProps {
  event: Event
}

const socialMediaOptions = [
  { value: 'facebook', label: 'Facebook', icon: '/icons/facebook-icon-event.svg' },
  { value: 'instagram', label: 'Instagram', icon: '/icons/instagram-icon-event.svg' },
  { value: 'twitter', label: 'Twitter', icon: '/icons/twitter-icon-event.svg' },
  { value: 'youtube', label: 'YouTube', icon: '/icons/youtube-icon-event.svg' },
  { value: 'tiktok', label: 'TikTok', icon: '/icons/tiktok-icon-event.svg' },
]

const EventSocialMedia = ({ event }: EventSocialMediaProps) => {
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>(
    event.socialLinks as { platform: string; url: string }[] || []
  )

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }])
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = [...socialLinks]
    newLinks.splice(index, 1)
    setSocialLinks(newLinks)
  }

  const handleLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index][field] = value
    setSocialLinks(newLinks)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // Filter out incomplete social links
      const completeLinks = socialLinks.filter(link => link.platform && link.url)

      await axiosInstance.put(`/api/events/edit/${event.id}`, { socialLinks: completeLinks })
      toast.success('Social media links updated successfully', {
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
      toast.error('Failed to update social media links', {
        description: (
          <div className="flex flex-col gap-1">
            <span>{error instanceof Error ? error.message : 'Please try again later'}</span>
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
      <div className="flex min-w-0 flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex flex-col gap-y-4">
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-x-4 sm:overflow-x-auto"
            >
              <div className="w-full min-w-0 sm:min-w-[9rem] sm:max-w-[12rem] sm:grow-0 sm:shrink">
                <Label>Platform</Label>
                <Select
                  value={link.platform}
                  onValueChange={(value) => handleLinkChange(index, 'platform', value)}
                >
                  <SelectTrigger className="min-w-0 w-full max-w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {socialMediaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full min-w-0 sm:min-w-[240px] sm:flex-1">
                <Label>URL</Label>
                <Input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  placeholder="Enter social media URL"
                  className="h-9 min-w-0 w-full max-w-full overflow-x-auto"
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => handleRemoveLink(index)}
                disabled={isLoading}
                className="mb-[2px] w-full shrink-0 sm:w-auto"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleAddLink} variant="outline" disabled={isLoading}>
            Add Social Media Link
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>Save Changes</Button>
        </div>
      </div>
    </>
  )
}

export default EventSocialMedia 