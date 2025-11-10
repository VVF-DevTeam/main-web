import React from 'react'
import { EventSeries } from '@prisma/client'

interface SeriesCardProps {
  series: EventSeries
  onClick?: () => void
}

const SeriesCard = ({ series, onClick }: SeriesCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-y-2 rounded-lg border-2 border-slate-300 bg-slate-100 p-4 transition-all hover:border-slate-500 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-800">{series.name}</h3>
      <p className="text-sm text-gray-600">Key: {series.keyName}</p>
      <p className="text-sm text-gray-600">Type: {series.eventType}</p>
      {series.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{series.description}</p>
      )}
    </div>
  )
}

export default SeriesCard


