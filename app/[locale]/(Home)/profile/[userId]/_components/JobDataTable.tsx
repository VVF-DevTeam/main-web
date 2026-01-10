'use client'

// Components
import { Job } from '@prisma/client'
import { useMemo } from 'react'
import { DataTable } from '@/app/[locale]/(Home)/registration/_components/_jobs/_allJob/data-table'
import { createJobColumns } from './jobColumnsProfile'

interface JobDataTableProps {
  data: Job[]
  locale: string
  userId: string
}

export default function JobDataTable({
  data,
  locale,
  userId,
}: JobDataTableProps) {
  const columns = useMemo(
    () => createJobColumns(locale, userId),
    [locale, userId]
  )
  return <DataTable columns={columns} data={data} />
}

