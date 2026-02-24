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
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex flex-col gap-y-4">
        {socialLinks.map((link, index) => (
          <div key={index} className="flex items-end gap-x-4">
            <div className="flex-1">
              <Label>Platform</Label>
              <Select
                value={link.platform}
                onValueChange={(value) => handleLinkChange(index, 'platform', value)}
              >
                <SelectTrigger>
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
            <div className="flex-1">
              <Label>URL</Label>
              <Input
                type="url"
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                placeholder="Enter social media URL"
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => handleRemoveLink(index)}
              disabled={isLoading}
              className="mb-[2px]"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-x-4">
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