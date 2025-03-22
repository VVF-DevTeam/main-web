'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'

import { XIcon, CheckIcon } from 'lucide-react'
import { Host } from '@/lib/types/HostType'
import { cn } from '@/lib/utils'
interface HostsSearchBoxProps {
  eventHosts: Host[]
  deleteHost: (hostId: string) => void
  hosts: string[]
  setHosts: React.Dispatch<React.SetStateAction<string[]>>
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  hostData: Host[]
}

const HostsSearchBox = ({
  eventHosts,
  deleteHost,
  hosts,
  setHosts,
  value,
  setValue,
  hostData,
}: HostsSearchBoxProps) => {
  const [visible, setVisible] = useState(false)

  const hostExists = (hosts: string[], host: Host) => {
    return (
      hosts.includes(host.id) ||
      eventHosts.some((eventHost) => eventHost.id === host.id)
    )
  }

  return (
    <div className="flex flex-col-default">
      <div className="flex-wrap-dafault items-center">
        {/* Display all the selected users with an x button */}
        {eventHosts.length > 0 ? (
          eventHosts.map((host: Host) => (
            <div
              key={host.id}
              className="flex-center gap-x-2 rounded-2xl border-2 border-slate-400 bg-slate-200 p-2"
              onClick={() => {
                deleteHost(host.id)
              }}
            >
              {host.name}
              <XIcon className="h-4 w-4 cursor-pointer font-bold" />
            </div>
          ))
        ) : (
          <p className="text-center text-sm italic text-muted-foreground">
            All your event hosts will appear here.
          </p>
        )}
      </div>
      <div className="flex-col-center gap-y-2">
        {/* Display all the available users with a search box */}
        <Input
          type="text"
          placeholder="Search for hosts"
          value={value}
          onFocus={() => setVisible(true)}
          onChange={(e) => {
            setValue(e.target.value)
          }}
        />
        {visible && hostData.length > 0 && (
          <div className="flex w-full flex-col text-balance rounded-full text-sm text-slate-900 transition-all ease-in">
            {hostData.map((host: Host) => (
              <button
                key={host.id}
                className={cn(
                  !hosts.includes(host.id)
                    ? 'flex cursor-pointer items-center justify-between border-b-2 border-slate-600 bg-gray-200 px-2 py-2 hover:bg-gray-300'
                    : 'flex cursor-pointer items-center justify-between border-b-2 border-slate-600 bg-gray-300 px-2 py-2 hover:bg-gray-400'
                )}
                onClick={() => {
                  if (eventHosts.some((eventHost) => eventHost.id === host.id))
                    return
                  if (hosts.includes(host.id)) {
                    setHosts(hosts.filter((id) => id !== host.id))
                  } else {
                    setHosts([...hosts, host.id])
                  }
                }}
              >
                {host.name}
                {hostExists(hosts, host) && (
                  <CheckIcon className="h-4 w-4 text-red-700" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HostsSearchBox
