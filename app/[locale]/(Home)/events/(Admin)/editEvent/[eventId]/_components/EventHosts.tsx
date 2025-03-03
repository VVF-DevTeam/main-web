'use client'
import React, { useState, useEffect } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import HostsSearchBox from '@/app/[locale]/components/HostsSearchBox'
import useDebounce from '@/hooks/useDebounce'
import getUsers from '@/lib/actions/getUsersAction'
import { Host } from '@/lib/types/HostType'
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
  const { toast } = useToast()

  console.log("hosts", hosts)
  const searchHosts = async (debouncedValue: string) => {
    setLoading(true)
    try {
      const response: Host[] = await getUsers(debouncedValue, 'HOST')
      setHostData(response)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  const addHosts = async (hostIds: string[]) => {
    if (hostIds.length === 0) return
    setLoading(true)
    try {
      const response = await axios.put(
        `/api/events/edit/${event.id}/hosts/edit`,
        {
          hostIds: hostIds,
        }
      )
      console.log(response)
      setHosts([])
      toast({
        title: 'Success',
        description: 'Hosts added successfully',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteHost = async (hostId: string) => {
    setLoading(true)
    try {
      const response = await axios.delete(
        `/api/events/edit/${event.id}/hosts/edit`,
        {
          data: { hostId: hostId },
        }
      )
      console.log(response)
      toast({
        title: 'Success',
        description: 'Host deleted successfully',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
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
