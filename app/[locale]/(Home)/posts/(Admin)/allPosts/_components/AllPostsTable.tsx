'use client'

// Components
import { Post } from '@prisma/client'
import { useMemo } from 'react'
import { DataTable } from './data-table'
import { createPostColumns } from './columns'

interface AllPostsTableProps {
  data: Post[]
  editLinkPattern: string
}

export default function AllPostsTable({
  data,
  editLinkPattern,
}: AllPostsTableProps) {
  const columns = useMemo(
    () => createPostColumns(editLinkPattern),
    [editLinkPattern]
  )
  return <DataTable columns={columns} data={data} />
}


