'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { axiosInstance } from '@/lib/axios'

interface EventNewSeriesProps {
  seriesId?: string
  initialName?: string
  initialKeyName?: string
  initialDescription?: string
  initialEventType?: string
  onReset?: () => void
}

const EventNewSeries = ({
  seriesId,
  initialName,
  initialKeyName,
  initialDescription,
  initialEventType,
  onReset,
}: EventNewSeriesProps) => {
  const [name, setName] = useState(initialName || '')
  const [description, setDescription] = useState(initialDescription || '')
  const [eventType, setEventType] = useState(initialEventType || '')

  const router = useRouter()

  // Helper function to generate keyName from name
  const generateKeyName = (nameValue: string) => {
    return nameValue
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Update form when initial values change (when a series is selected)
  useEffect(() => {
    if (initialName !== undefined) {
      setName(initialName || '')
      setDescription(initialDescription || '')
      setEventType(initialEventType || '')
    }
  }, [seriesId, initialName, initialDescription, initialEventType])

  const isDisabled = name.length === 0 || eventType.length === 0
  const isEditMode = !!seriesId

  const saveSeries = async () => {
    if (name.length === 0 || eventType.length === 0) return
    
    // Generate keyName from name
    const generatedKeyName = isEditMode && initialKeyName 
      ? initialKeyName 
      : generateKeyName(name)
    
    const data = {
      name: name,
      keyName: generatedKeyName,
      description: description || null,
      eventType: eventType,
    }

    try {
      if (isEditMode) {
        // Update existing series
        const response = await axiosInstance.put(`/api/series/edit/${seriesId}`, data)
        if (response.status === 200) {
          toast.success('Series updated successfully')
        }
      } else {
        // Create new series
        const response = await axiosInstance.post(`/api/series/create`, data)
        if (response.status === 200) {
          toast.success('Series created successfully')
        }
      }

      // reset all states
      setName('')
      setDescription('')
      setEventType('')

      // Call onReset if provided
      if (onReset) {
        onReset()
      }

      router.refresh()
    } catch (error) {
      console.log(error)
      const errorMessage =
        error.response?.data || error.message || 'Please try again later'
      toast.error('Something went wrong', { description: errorMessage })
    }
  }

  return (
    <div className="relative grid grid-cols-1 justify-items-center gap-y-12 md:grid-cols-2 md:place-items-start md:justify-items-start md:gap-x-6">
      {/* ------------------ Column 1 -------------------------*/}
      <div className="flex w-full flex-col gap-y-10">
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP I: Enter series name.
          </h3>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eg: Summer Series 2024"
            className="max-w-[350px] bg-slate-100 text-gray-800"
          />
          <p className="mt-2 text-xs text-gray-500">
            Key name will be auto-generated from the series name. <br />
            For example: &apos;summer-series-2024&apos;
          </p>
        </div>
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP II: Choose event type.
          </h3>
          <Select onValueChange={setEventType} value={eventType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLASS">Class</SelectItem>
              <SelectItem value="CONCERT">Concert</SelectItem>
              <SelectItem value="CAMPING">Camping</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ------------------ Column 2 -------------------------*/}
      <div className="flex w-full flex-col gap-y-10">
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP III: Enter description (optional).
          </h3>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this series..."
            className="min-h-[150px] max-w-[350px] bg-slate-100 text-gray-800"
          />
        </div>
      </div>

      {/* ------------------ Save Button ------------------------- */}
      <Button
        onClick={() => saveSeries()}
        className="mt-6 md:absolute md:bottom-0 md:right-0"
        disabled={isDisabled}
      >
        {isEditMode ? 'Update Series' : 'Save Series'}
      </Button>
    </div>
  )
}

export default EventNewSeries


