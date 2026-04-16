'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'

interface ExportToExcelButtonProps {
  data: Record<string, unknown>[]
  filename?: string
  sheetName?: string
  className?: string
}

export default function ExportToExcelButton({
  data,
  filename = 'export',
  sheetName = 'Sheet1',
  className,
}: ExportToExcelButtonProps) {
  const handleExport = () => {
    if (!data.length) return

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data.length}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  )
}
