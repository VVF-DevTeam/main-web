'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PaymentPageSizeSelect({ value }: { value: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('pageSize', newValue)
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


