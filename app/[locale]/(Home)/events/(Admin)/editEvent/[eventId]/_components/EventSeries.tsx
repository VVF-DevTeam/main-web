'use client'
import React, { useState, useEffect } from 'react'
import { Event, EventSeries } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import useDebounce from '@/hooks/useDebounce'

interface EventEditSeriesProps {
  event: Event & { series: EventSeries | null }
  allSeries: EventSeries[]
}

const EventEditSeries = ({ event, allSeries }: EventEditSeriesProps) => {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSeries, setFilteredSeries] = useState<EventSeries[]>(allSeries)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [visible, setVisible] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  // Filter series based on search term and event type
  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = allSeries.filter(
        (series) =>
          series.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          series.keyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      setFilteredSeries(filtered)
    } else {
      // When there's no search term, show all series
      setFilteredSeries(allSeries)
    }
  }, [debouncedSearchTerm, allSeries, event.eventType])

  // Initialize selected series when editing mode is enabled
  useEffect(() => {
    if (isEditing && event.series) {
      setSelectedSeriesId(event.series.id)
    } else if (isEditing) {
      setSelectedSeriesId('')
    }
  }, [isEditing, event.series])

  const updateSeries = async (seriesId: string | null) => {
    setLoading(true)
    try {
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}/series/edit`,
        {
          seriesId: seriesId,
        }
      )
      console.log(response)
      toast.success('Event series updated successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error ? error.message : 'Please try again later'}
            </span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const removeSeries = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.delete(
        `/api/events/edit/${event.id}/series/edit`
      )
      console.log(response)
      toast.success('Event series removed successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error ? error.message : 'Please try again later'}
            </span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Series</h3>
        <Button
          variant={null}
          onClick={() => {
            setIsEditing(!isEditing) 
            setVisible(false)
          }}
          className={cn(
            isEditing
              ? 'font-semibold text-gray-700 transition-all duration-75 hover:text-red-700'
              : 'font-semibold text-red-700 transition-all duration-75 hover:text-gray-700'
          )}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <span className="flex gap-x-2">
              Edit <Pencil className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-4">
              <Input
                type="text"
                placeholder="Search for series..."
                value={searchTerm}
                onFocus={() => setVisible(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-[350px]"
              />
              {visible && (
                <div className="flex w-full max-w-[350px] flex-col overflow-hidden rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm">
                  {filteredSeries.length > 0 ? (
                    filteredSeries.map((series) => {
                      const isSelected = selectedSeriesId === series.id
                      return (
                        <button
                          key={series.id}
                          className={cn(
                            !isSelected
                              ? 'flex cursor-pointer items-center justify-between border-b border-slate-200 px-3 py-2 text-left hover:bg-gray-100'
                              : 'flex cursor-pointer items-center justify-between border-b border-slate-200 bg-gray-200 px-3 py-2 text-left hover:bg-gray-300'
                          )}
                          onClick={() => {
                            setSelectedSeriesId((prev) =>
                              prev === series.id ? '' : series.id
                            )
                          }}
                        >
                          <span>
                            {series.name}{' '}
                            <span className="text-xs text-slate-600">
                              ({series.eventType})
                            </span>
                          </span>
                          {isSelected && (
                            <span className="text-xs font-semibold text-red-700">
                              Selected
                            </span>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No series found. Create one{' '}
                      <a
                        href="/events/createEventSeries"
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        here
                      </a>
                      .
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="-mt-2 text-xs text-muted-foreground">
              Choose an event series for this event.
            </p>

            <div className="flex gap-x-4">
              {event.series && (
                <Button
                  variant={'destructive'}
                  onClick={removeSeries}
                  disabled={loading}
                >
                  Remove Series
                </Button>
              )}
              <Button
                variant={'default'}
                className="ml-auto"
                disabled={loading || !selectedSeriesId}
                onClick={() => updateSeries(selectedSeriesId)}
              >
                Save
              </Button>
            </div>
          </div>
        ) : event.series ? (
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2 rounded-2xl border-2 border-slate-400 bg-slate-200 px-4 py-2">
              <span className="font-semibold">{event.series.name}</span>
              <span className="text-sm text-gray-600">
                ({event.series.eventType})
              </span>
            </div>
          </div>
        ) : (
          <p className="italic text-muted-foreground text-slate-500">
            No series assigned to this event.
          </p>
        )}
      </div>
    </div>
  )
}

export default EventEditSeries

