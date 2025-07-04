'use client'
import React, { useState, useEffect } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import HostsSearchBox from '@/app/[locale]/components/HostsSearchBox'
import useDebounce from '@/hooks/useDebounce'
import getUsersWithRole from '@/lib/actions/user/getUsersWithRole'
import { Host } from '@/lib/types/HostType'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

interface EventHostsProps {
  event: Event & { hosts: Host[] }
}

const EventHosts = ({ event }: EventHostsProps) => {
  const [hosts, setHosts] = useState<string[]>([])
  const [hostData, setHostData] = useState<Host[]>([])

  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const debouncedValue = useDebounce(value, 1500)

  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  const searchHosts = async (debouncedValue: string) => {
    setLoading(true)
    try {
      const response: Host[] = await getUsersWithRole(debouncedValue, 'HOST')
      setHostData(response)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', { 
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
      setLoading(false)
    }
  }

  const addHosts = async (hostIds: string[]) => {
    if (hostIds.length === 0) return
    setLoading(true)
    try {
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}/hosts/edit`,
        {
          hostIds: hostIds,
        }
      )
      console.log(response)
      setHosts([])
      toast.success('Hosts added successfully', {
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
      toast.error('Something went wrong', { 
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
      setLoading(false)
    }
  }

  const deleteHost = async (hostId: string) => {
    setLoading(true)
    try {
      const response = await axiosInstance.delete(
        `/api/events/edit/${event.id}/hosts/edit`,
        {
          data: { hostId: hostId },
        }
      )
      console.log(response)
      toast.success('Host deleted successfully', {
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
      toast.error('Something went wrong', { 
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
      setLoading(false)
    }
  }

  useEffect(() => {
    searchHosts(debouncedValue)
  }, [debouncedValue])

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Hosts</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'text-gray-700transition-all font-semibold duration-75 hover:text-red-700'
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

      {/* FORM */}
      <div className="mt-2">
        {isEditing ? (
          <div className="flex flex-col gap-y-6">
            <HostsSearchBox
              eventHosts={event.hosts}
              deleteHost={deleteHost}
              hosts={hosts}
              setHosts={setHosts}
              value={value}
              setValue={setValue}
              hostData={hostData}
            />

            <p className="-mt-2 text-xs text-muted-foreground">
              Choose event hosts.
            </p>
            <Button
              variant={'default'}
              className="ml-auto"
              disabled={loading || hosts.length === 0}
              onClick={() => addHosts(hosts)}
            >
              Save
            </Button>
          </div>
        ) : event.hosts.length === 0 ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add the hosts for this event.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-muted-foreground">
            {event.hosts.map((host, index) => (
              <div
                className="flex items-center justify-center rounded-2xl border-2 border-slate-400 bg-slate-200 p-1 font-semibold"
                key={index}
              >
                {host.name?.split(' ')[0]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventHosts
