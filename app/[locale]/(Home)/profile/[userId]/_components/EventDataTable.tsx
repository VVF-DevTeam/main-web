'use client'

// Components
import { Event } from '@prisma/client'
import { useMemo } from 'react'
import { DataTable } from '@/app/[locale]/(Home)/events/(Admin)/allEvents/_components/data-table'
import { createEventColumns } from './eventColumns'

interface EventDataTableProps {
  data: Event[]
  locale: string
  userId: string
}

export default function EventDataTable({
  data,
  locale,
  userId,
}: EventDataTableProps) {
  const columns = useMemo(
    () => createEventColumns(locale, userId),
    [locale, userId]
  )
  return <DataTable columns={columns} data={data} />
}

