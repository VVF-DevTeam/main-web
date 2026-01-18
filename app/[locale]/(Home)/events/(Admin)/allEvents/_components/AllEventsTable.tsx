'use client'

// Components
import { Event } from '@prisma/client'
import { useMemo } from 'react'
import { DataTable } from './data-table'
import { createEventColumns } from './columns'

interface AllEventsTableProps {
  data: Event[]
  editLinkPattern: string
}

export default function AllEventsTable({
  data,
  editLinkPattern,
}: AllEventsTableProps) {
  const columns = useMemo(
    () => createEventColumns(editLinkPattern),
    [editLinkPattern]
  )
  return <DataTable columns={columns} data={data} />
}

