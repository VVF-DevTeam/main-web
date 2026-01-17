'use client'

import React, { useState } from 'react'
import { Event, EventSponsor, SponsorTier } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Edit, X } from 'lucide-react'

import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SponsorOnEvent = {
  eventId: string
  tier: SponsorTier
  order: number | null
  event: {
    id: string
    title: string
  }
}

type SponsorWithEvents = EventSponsor & { events: SponsorOnEvent[] }

interface SponsorsManagerProps {
  sponsors: SponsorWithEvents[]
  allEvents: { id: string; title: string }[]
}

const SponsorsManager = ({
  sponsors = [],
  allEvents = [],
}: SponsorsManagerProps) => {
  const router = useRouter()

  const [editingSponsor, setEditingSponsor] =
    useState<SponsorWithEvents | null>(null)
  const [name, setName] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [description, setDescription] = useState('')
  const [displayName, setDisplayName] = useState(false)
  const [selectedEventTiers, setSelectedEventTiers] = useState<
    Record<string, { tier: SponsorTier; order: number }>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [url, setUrl] = useState('')
  const currentDateTime = getCurrentDateTime()

  const resetForm = () => {
    setEditingSponsor(null)
    setName('')
    setImgUrl('')
    setDescription('')
    setDisplayName(false)
    setSelectedEventTiers({})
    setUrl('')
  }

  const handleEditClick = (sponsor: SponsorWithEvents) => {
    setEditingSponsor(sponsor)
    setName(sponsor.name)
    setImgUrl(sponsor.imgUrl)
    setUrl(sponsor.url ?? '')
    setDescription(sponsor.description ?? '')
    setDisplayName(sponsor.displayName)

    // Build the selectedEventTiers object from sponsor.events
    const eventTiers: Record<string, { tier: SponsorTier; order: number }> = {}
    sponsor.events.forEach((sponsorEvent) => {
      eventTiers[sponsorEvent.eventId] = {
        tier: sponsorEvent.tier,
        order: sponsorEvent.order ?? 0,
      }
    })
    setSelectedEventTiers(eventTiers)
  }

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventTiers((prev) => {
      if (prev[eventId]) {
        // Unselect the event
        const newState = { ...prev }
        delete newState[eventId]
        return newState
      } else {
        // Select the event with default tier
        return {
          ...prev,
          [eventId]: {
            tier: 'Bronze' as SponsorTier,
            order: 0,
          },
        }
      }
    })
  }

  const updateEventTier = (eventId: string, tier: SponsorTier) => {
    setSelectedEventTiers((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        tier,
      },
    }))
  }

  const updateEventOrder = (eventId: string, order: number) => {
    setSelectedEventTiers((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        order,
      },
    }))
  }

  const handleSubmit = async () => {
    if (!name || !imgUrl) {
      toast.error('Name and image link are required')
      return
    }

    const selectedEvents = Object.entries(selectedEventTiers)

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event')
      return
    }

    setIsSubmitting(true)

    const payload = {
      name,
      imgUrl,
      url: url || null,
      description: description || null,
      displayName,
      events: selectedEvents.map(([eventId, data]) => ({
        eventId,
        tier: data.tier,
        order: data.order,
      })),
    }

    try {
      if (editingSponsor) {
        // Update existing sponsor
        const res = await axiosInstance.put(
          `/api/sponsors/edit/${editingSponsor.id}`,
          payload
        )
        if (res.status === 200) {
          toast.success('Sponsor updated successfully', {
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
            style: {
              color: '#22c55e', // green-500 color
            },
          })
        } else {
          toast.error('Something went wrong', {
            description: (
              <div className="flex flex-col gap-1">
                <span>{res.data?.message || 'Please try again later'}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        }
      } else {
        // Create new sponsor
        const res = await axiosInstance.post('/api/sponsors/create', payload)
        if (res.status === 200) {
          toast.success('Sponsor created successfully', {
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
            style: {
              color: '#22c55e', // green-500 color
            },
          })
        } else {
          toast.error('Something went wrong', {
            description: (
              <div className="flex flex-col gap-1">
                <span>{res.data?.message || 'Please try again later'}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        }
      }

      resetForm()
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
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
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isSubmitting && <Loader />}
      <div className="mt-8 flex flex-col gap-10">
        <h1 className="mb-4 text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          Manage Sponsors
        </h1>

      {/* Sponsors list and form */}
      <div className="flex flex-col gap-6 rounded-xl bg-slate-100 p-6 lg:flex-row lg:items-start">
        {/* Left side: Sponsors list */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Sponsors</h2>
            <Button size="sm" onClick={resetForm} className="gap-2" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
              New Sponsor
            </Button>
          </div>

          {sponsors.length > 0 ? (
            <div className="space-y-3">
              {sponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className={`p-4 transition-shadow ${!isSubmitting ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'} ${sponsor.name === editingSponsor?.name ? 'bg-bgColor-secondary200' : ''}`}
                  onClick={() => !isSubmitting && handleEditClick(sponsor)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsor.imgUrl}
                        alt={sponsor.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold">{sponsor.name}</span>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {sponsor.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {sponsor.description}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {sponsor.events && sponsor.events.length > 0 ? (
                          <>
                            {sponsor.events.slice(0, 4).map((sponsorEvent) => (
                              <span
                                key={sponsorEvent.eventId}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                              >
                                {sponsorEvent.event.title} ({sponsorEvent.tier})
                              </span>
                            ))}
                            {sponsor.events.length > 4 && (
                              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                ...
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">
                            No events assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-white p-8">
              <p className="text-center text-sm text-muted-foreground">
                No sponsors yet. Create your first sponsor!
              </p>
            </div>
          )}
        </div>

        {/* Right side: Sponsor form */}
        <div className="flex-1 rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
            </h2>
            {editingSponsor && (
              <Button size="sm" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sponsor form */}
          <div className="space-y-4">
            {/* Sponsor Name */}
            <div>
              <label
                htmlFor="sponsorName"
                className="mb-1 block text-sm font-medium"
              >
                Sponsor Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="sponsorName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eg: Awesome Company Inc."
                disabled={isSubmitting}
              />
            </div>

            {/* Display sponsor name on event page */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="displayName"
                checked={displayName}
                onCheckedChange={(checked) =>
                  setDisplayName(checked as boolean)
                }
                disabled={isSubmitting}
              />
              <label
                htmlFor="displayName"
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Display sponsor name on event page
              </label>
            </div>

            {/* Image Link */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Image Link <span className="text-red-500">*</span>
                <p>
                  (upload image to{' '}
                  <a
                    className="text-blue-700 underline"
                    href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Drive
                  </a>{' '}
                  and use format below, check{' '}
                  <a
                    className="text-blue-700 underline"
                    href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
                    target="_blank"
                    rel="noreferrer"
                  >
                    here
                  </a>
                  . Please use image with transparent background for best
                  results)
                </p>
              </label>
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://drive.google.com/thumbnail?id=xxx"
                disabled={isSubmitting}
              />
              {/* Image preview when user inputs image link */}
              {imgUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="overflow-hidden rounded bg-slate-100">
                    <Image
                      src={imgUrl}
                      alt="Sponsor preview"
                      width={200}
                      height={200}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Preview of the sponsor image
                  </span>
                </div>
              )}
            </div>

            {/* Sponsor URL */}
            <div>
              <label
                htmlFor="sponsorUrl"
                className="mb-1 block text-sm font-medium"
              >
                URL (optional)
              </label>
              <Input
                id="sponsorUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Sponsor Description */}
            <div>
              <label
                htmlFor="sponsorDescription"
                className="mb-1 block text-sm font-medium"
              >
                Description (optional)
              </label>
              <Textarea
                id="sponsorDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description about the sponsor..."
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Associated Events */}
            <div>
              <div className="mb-2 block text-sm font-medium">
                Associated Events <span className="text-red-500">*</span>
              </div>
              {allEvents && allEvents.length > 0 ? (
                <>
                  <div className="max-h-[300px] space-y-3 overflow-y-auto rounded-md border p-3">
                    {allEvents.map((event) => (
                      <div key={event.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={!!selectedEventTiers[event.id]}
                            onCheckedChange={() =>
                              toggleEventSelection(event.id)
                            }
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={event.id}
                            className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {event.title}
                          </label>
                        </div>
                        {selectedEventTiers[event.id] && (
                          <div className="ml-6 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                Tier:
                              </label>
                              <Select
                                value={selectedEventTiers[event.id].tier}
                                onValueChange={(value) =>
                                  updateEventTier(
                                    event.id,
                                    value as SponsorTier
                                  )
                                }
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Platinum">
                                    Platinum
                                  </SelectItem>
                                  <SelectItem value="Gold">Gold</SelectItem>
                                  <SelectItem value="Silver">Silver</SelectItem>
                                  <SelectItem value="Bronze">Bronze</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                Order:
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={selectedEventTiers[event.id].order}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value)
                                  if (!isNaN(value) && value >= 0) {
                                    updateEventOrder(event.id, value)
                                  } else if (e.target.value === '') {
                                    updateEventOrder(event.id, 0)
                                  }
                                }}
                                className="h-8 w-20"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select which events this sponsor is associated with and
                    choose their tier and display order (lower numbers appear
                    first)
                  </p>
                </>
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    No events available. Please create an event first before
                    adding sponsors.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !name ||
                  !imgUrl ||
                  Object.keys(selectedEventTiers).length === 0 ||
                  allEvents.length === 0
                }
              >
                {editingSponsor ? 'Update Sponsor' : 'Save Sponsor'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default SponsorsManager
