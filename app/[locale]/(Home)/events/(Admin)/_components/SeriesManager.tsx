'use client'
import React, { useState } from 'react'
import { EventSeries } from '@prisma/client'
import { Separator } from '@/components/ui/separator'
import EventNewSeries from './EventNewSeries'
import SeriesCard from './SeriesCard'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SeriesManagerProps {
  eventSeries: EventSeries[]
}

const SeriesManager = ({ eventSeries }: SeriesManagerProps) => {
  const [selectedSeries, setSelectedSeries] = useState<EventSeries | null>(null)

  const handleSeriesClick = (series: EventSeries) => {
    setSelectedSeries(series)
  }

  const handleReset = () => {
    setSelectedSeries(null)
  }

  return (
    <>
      {/* Section 1 */}
      <div className="flex flex-col gap-y-12 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          All Event Series
        </h1>

        {eventSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              No series to show. All event series would appear here.
            </p>
            <Button
              onClick={handleReset}
              className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm rounded-lg h-auto min-h-[120px] w-full max-w-[300px] flex flex-col items-center justify-center gap-2"
              title="Add new series"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Add New Series</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onClick={() => handleSeriesClick(series)}
              />
            ))}
            <Button
              onClick={handleReset}
              className="bg-white text-black border-2 border-slate-300 hover:border-slate-500 hover:bg-gray-50 hover:shadow-md rounded-lg h-auto min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              title="Add new series"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Add New Series</span>
            </Button>
          </div>
        )}
      </div>

      <Separator className="mx-auto mb-[5vh] mt-[5vh] w-[70%] bg-red-700" />

      {/* Section 2 */}
      <div className="flex flex-col gap-y-20 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          {selectedSeries ? 'Edit Event Series' : 'Create New Event Series'}
        </h1>
        <EventNewSeries
          key={selectedSeries?.id || 'new'}
          seriesId={selectedSeries?.id}
          initialName={selectedSeries?.name}
          initialKeyName={selectedSeries?.keyName}
          initialDescription={selectedSeries?.description || undefined}
          initialEventType={selectedSeries?.eventType}
          onReset={handleReset}
        />
      </div>
    </>
  )
}

export default SeriesManager


