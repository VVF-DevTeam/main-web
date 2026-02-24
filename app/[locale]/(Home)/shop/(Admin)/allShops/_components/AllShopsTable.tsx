'use client'

// Components
import { useMemo } from 'react'
import { DataTable } from './data-table'
import { createShopColumns, type ShopWithEvent } from './columns'

interface AllShopsTableProps {
  data: ShopWithEvent[]
  editLinkPattern: string
}

export default function AllShopsTable({
  data,
  editLinkPattern,
}: AllShopsTableProps) {
  const columns = useMemo(
    () => createShopColumns(editLinkPattern),
    [editLinkPattern]
  )
  return <DataTable columns={columns} data={data} />
}

