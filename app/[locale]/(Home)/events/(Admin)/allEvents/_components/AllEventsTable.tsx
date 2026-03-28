'use client'

// Components
import { useMemo } from 'react'
import type { EventWithHostsForAdmin } from '@/lib/actions/event/getEvent'
import { DataTable } from './data-table'
import { createEventColumns } from './columns'

interface AllEventsTableProps {
  data: EventWithHostsForAdmin[]
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

