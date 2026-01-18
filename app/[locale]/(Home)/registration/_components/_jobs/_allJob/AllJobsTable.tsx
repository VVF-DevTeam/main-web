'use client'

// Components
import { Job } from '@prisma/client'
import { useMemo } from 'react'
import { DataTable } from './data-table'
import { createJobColumns } from './columns'

interface AllJobsTableProps {
  data: Job[]
  editLinkPattern: string
}

export default function AllJobsTable({
  data,
  editLinkPattern,
}: AllJobsTableProps) {
  const columns = useMemo(
    () => createJobColumns(editLinkPattern),
    [editLinkPattern]
  )
  return <DataTable columns={columns} data={data} />
}

