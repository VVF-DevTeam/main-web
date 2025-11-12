'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { Event, EventTicket } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Square } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { axiosInstance } from '@/lib/axios'
import seatStatusMapping from '@/lib/constants/seatStatusMapping.json'
import { AxiosError } from 'axios'

interface EventSeatingProps {
  event: Event & { tickets?: EventTicket[] }
}

// Seat status mapping
export const SEAT_STATUS = {
  NO_SEAT: 0,
  HAS_SEAT: 1,
  OCCUPIED: 2,
}

export const SEAT_STATUS_USER: Record<number, string> = {
  1: 'Available Seat',
  2: 'Reserved Seat',
}

export const SEAT_STATUS_LABELS: Record<number, string> =
  seatStatusMapping as Record<number, string>

export const getSeatStatusLabel = (status: number): string => {
  return SEAT_STATUS_LABELS[status] || 'unknown'
}

// Seat is always an object with status attribute
export type SeatValue = {
  ticketType: string
  ticketId: string
  name?: string
  status: number
}

const createEmptySeat = (): SeatValue => ({
  ticketType: '',
  ticketId: '',
  name: '',
  status: SEAT_STATUS.NO_SEAT,
})
export type SeatingMap = SeatValue[][]

const EventSeatingSchema = z.object({
  width: z.coerce
    .number()
    .min(1, { message: 'Width must be at least 1' })
    .max(100, { message: 'Width must be at most 100' }),
  height: z.coerce
    .number()
    .min(1, { message: 'Height must be at least 1' })
    .max(100, { message: 'Height must be at most 100' }),
})

const EventSeating = ({ event }: EventSeatingProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isEditingSeats, setIsEditingSeats] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<{
    row: number
    col: number
  } | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)
  const [selectionType, setSelectionType] = useState<'seat' | 'row' | 'column'>(
    'seat'
  )
  const [seatingMap, setSeatingMap] = useState<SeatingMap>(() => {
    if (
      event.seatingMap &&
      Array.isArray(event.seatingMap) &&
      event.seatingMap.length > 0
    ) {
      // Validate and convert the seating map structure
      try {
        const map = event.seatingMap
        if (Array.isArray(map[0])) {
          return map as SeatingMap
        }
      } catch (e) {
        console.error('Error parsing seating map:', e)
      }
    }
    return []
  })
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [rowNames, setRowNames] = useState<string[]>(() => {
    // Initialize with default names (A, B, C, etc.)
    if (seatingMap.length > 0) {
      return Array(seatingMap.length)
        .fill(null)
        .map((_, i) => String.fromCharCode(65 + i)) // A, B, C, ...
    }
    return []
  })
  const [columnNames, setColumnNames] = useState<string[]>(() => {
    // Initialize with default names (1, 2, 3, etc.)
    if (seatingMap.length > 0 && seatingMap[0]?.length > 0) {
      return Array(seatingMap[0].length)
        .fill(null)
        .map((_, i) => String(i + 1))
    }
    return []
  })
  const currentDateTime = getCurrentDateTime()
  const tickets = event.tickets || []

  const form = useForm<z.infer<typeof EventSeatingSchema>>({
    resolver: zodResolver(EventSeatingSchema),
    defaultValues: {
      width:
        seatingMap.length > 0 && seatingMap[0]?.length
          ? seatingMap[0].length
          : 0,
      height: seatingMap.length > 0 ? seatingMap.length : 0,
    },
  })

  const widthValue = form.watch('width')
  const heightValue = form.watch('height')

  // Update row and column names when dimensions change
  useEffect(() => {
    if (!editing) return

    const w =
      typeof widthValue === 'number' ? widthValue : Number(widthValue) || 0
    const h =
      typeof heightValue === 'number' ? heightValue : Number(heightValue) || 0

    if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) {
      return
    }

    // Update row names
    setRowNames((prev) => {
      if (prev.length === h) return prev
      const newRows = [...prev]
      while (newRows.length < h) {
        newRows.push(String.fromCharCode(65 + newRows.length)) // A, B, C, ...
      }
      return newRows.slice(0, h)
    })

    // Update column names
    setColumnNames((prev) => {
      if (prev.length === w) return prev
      const newCols = [...prev]
      while (newCols.length < w) {
        newCols.push(String(newCols.length + 1))
      }
      return newCols.slice(0, w)
    })
  }, [widthValue, heightValue, editing])

  // Update seating map when dimensions change (only when editing)
  useEffect(() => {
    if (!editing) return

    const w =
      typeof widthValue === 'number' ? widthValue : Number(widthValue) || 0
    const h =
      typeof heightValue === 'number' ? heightValue : Number(heightValue) || 0

    if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) {
      return
    }

    setSeatingMap((prevMap) => {
      const currentH = prevMap.length
      const currentW = prevMap[0]?.length || 0

      // If dimensions match, keep existing map
      if (currentH === h && currentW === w) {
        return prevMap
      }

      // Resize the seating map
      const newMap: SeatingMap = Array(h)
        .fill(null)
        .map((_, rowIdx) => {
          if (rowIdx < currentH && prevMap[rowIdx]) {
            // Preserve existing row, extend or truncate as needed
            return Array(w)
              .fill(null)
              .map((_, colIdx) => {
                if (
                  colIdx < currentW &&
                  prevMap[rowIdx][colIdx] !== undefined
                ) {
                  return prevMap[rowIdx][colIdx]
                }
                return createEmptySeat()
              })
          }
          // New row, initialize with default empty seats
          return Array(w)
            .fill(null)
            .map(() => createEmptySeat())
        })
      return newMap
    })
  }, [widthValue, heightValue, editing])

  // Generate preview matrix from current seating map
  const previewMatrix = useMemo(() => {
    const w =
      typeof widthValue === 'number' ? widthValue : Number(widthValue) || 0
    const h =
      typeof heightValue === 'number' ? heightValue : Number(heightValue) || 0

    if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) {
      return []
    }

    return seatingMap.length === h && seatingMap[0]?.length === w
      ? seatingMap
      : Array(h)
          .fill(null)
          .map(() =>
            Array(w)
              .fill(null)
              .map(() => createEmptySeat())
          )
  }, [widthValue, heightValue, seatingMap])

  const width =
    typeof widthValue === 'number' ? widthValue : Number(widthValue) || 0
  const height =
    typeof heightValue === 'number' ? heightValue : Number(heightValue) || 0

  const { isSubmitting, isValid } = form.formState

  const handleSeatClick = (rowIndex: number, colIndex: number) => {
    if (!isEditingSeats) return
    setSelectedSeat({ row: rowIndex, col: colIndex })
    setSelectedRow(null)
    setSelectedColumn(null)
    setSelectionType('seat')
    const seat = previewMatrix[rowIndex]?.[colIndex]
    if (seat && seat.ticketId) {
      setSelectedTicketId(seat.ticketId)
    } else {
      setSelectedTicketId('')
    }
  }

  const handleRowClick = (rowIndex: number) => {
    if (!isEditingSeats) return
    setSelectedRow(rowIndex)
    setSelectedSeat(null)
    setSelectedColumn(null)
    setSelectionType('row')
    // Check if all seats in the row have the same ticket
    const row = previewMatrix[rowIndex]
    if (row && row.length > 0) {
      const firstSeat = row[0]
      if (firstSeat && firstSeat.ticketId) {
        // Check if all seats have the same ticket
        const allSame = row.every((seat) => seat && seat.ticketId === firstSeat.ticketId)
        if (allSame) {
          setSelectedTicketId(firstSeat.ticketId)
        } else {
          setSelectedTicketId('')
        }
      } else {
        setSelectedTicketId('')
      }
    } else {
      setSelectedTicketId('')
    }
  }

  const handleColumnClick = (colIndex: number) => {
    if (!isEditingSeats) return
    setSelectedColumn(colIndex)
    setSelectedSeat(null)
    setSelectedRow(null)
    setSelectionType('column')
    // Check if all seats in the column have the same ticket
    const column = previewMatrix.map((row) => row[colIndex])
    if (column && column.length > 0) {
      const firstSeat = column[0]
      if (firstSeat && firstSeat.ticketId) {
        // Check if all seats have the same ticket
        const allSame = column.every((seat) => seat && seat.ticketId === firstSeat.ticketId)
        if (allSame) {
          setSelectedTicketId(firstSeat.ticketId)
        } else {
          setSelectedTicketId('')
        }
      } else {
        setSelectedTicketId('')
      }
    } else {
      setSelectedTicketId('')
    }
  }

  const generateSeatName = (rowIndex: number, colIndex: number) => {
    const rowName = rowNames[rowIndex] || String.fromCharCode(65 + rowIndex)
    const colName = columnNames[colIndex] || String(colIndex + 1)
    return `${rowName}${colName}`
  }

  // Helper function to check if a seat has status 0
  const hasStatusZero = (seat: SeatValue): boolean => {
    return seat.status === 0
  }

  const handleTicketSelect = (ticketId: string) => {
    if (!selectedSeat && selectedRow === null && selectedColumn === null) return

    const newSeatingMap = previewMatrix.map((row, rIdx) =>
      row.map((seat, cIdx) => {
        let shouldUpdate = false

        if (selectionType === 'seat' && selectedSeat) {
          shouldUpdate = rIdx === selectedSeat.row && cIdx === selectedSeat.col
        } else if (selectionType === 'row' && selectedRow !== null) {
          shouldUpdate = rIdx === selectedRow
        } else if (selectionType === 'column' && selectedColumn !== null) {
          shouldUpdate = cIdx === selectedColumn
        }

        if (shouldUpdate) {
          if (!ticketId || ticketId === '') {
            // Return seat with default empty values when clearing
            return createEmptySeat()
          }
          const ticket = tickets.find((t) => t.id === ticketId)
          if (ticket) {
            // If current seat has status 0 or no status, change to status 1 when linking ticket
            // Otherwise, preserve existing status
            const seatStatus =
              hasStatusZero(seat) || seat.status === undefined
                ? SEAT_STATUS.HAS_SEAT
                : seat.status

            return {
              ticketType: ticket.type,
              ticketId: ticket.id,
              name: generateSeatName(rIdx, cIdx),
              status: seatStatus,
            }
          }
          return createEmptySeat()
        }
        return seat
      })
    )

    setSeatingMap(newSeatingMap)
    setSelectedTicketId(ticketId)
  }

  const handleSaveTicket = () => {
    handleTicketSelect(selectedTicketId)
    setSelectedSeat(null)
    setSelectedRow(null)
    setSelectedColumn(null)
    setSelectedTicketId('')
    setSelectionType('seat')
  }

  const handleClearSeat = () => {
    if (!selectedSeat && selectedRow === null && selectedColumn === null) return
    handleTicketSelect('')
    setSelectedSeat(null)
    setSelectedRow(null)
    setSelectedColumn(null)
    setSelectedTicketId('')
    setSelectionType('seat')
  }

  const onSubmit = async (values: z.infer<typeof EventSeatingSchema>) => {
    try {
      // Use current seating map or generate new one
      let matrix: SeatingMap
      if (
        seatingMap.length === values.height &&
        seatingMap[0]?.length === values.width
      ) {
        // Update seat names based on current row/column names before saving
        matrix = seatingMap.map((row, rIdx) =>
          row.map((seat, cIdx) => {
            // If seat has a ticket, update the name and preserve status
            if (seat.ticketId) {
              return {
                ...seat,
                name: generateSeatName(rIdx, cIdx),
              }
            }
            // Otherwise, return seat as is (empty/default seat)
            return seat
          })
        )
      } else {
        // Generate new matrix with specified dimensions
        matrix = Array(values.height)
          .fill(null)
          .map(() =>
            Array(values.width)
              .fill(null)
              .map(() => createEmptySeat())
          )
      }

      // Save to event
      await axiosInstance.put(`/api/events/edit/${event.id}`, {
        seatingMap: matrix,
      })

      setEditing(false)
      setIsEditingSeats(false)
      toast.success('Event seating map updated successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data || error.message || 'An unknown error occurred'
        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      } else {
        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>
                {error instanceof Error
                  ? error.message
                  : 'An unknown error occurred'}
              </span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    }
  }

  const hasSeatingMap = seatingMap.length > 0 && seatingMap[0]?.length > 0

  // Generate a consistent color for each ticket (using ticketId for uniqueness)
  const getTicketColor = (ticketId: string, ticketType: string): string => {
    // Use ticketId for color assignment to ensure uniqueness
    // Combine with ticketType for better hash distribution
    const combined = `${ticketId}-${ticketType}`

    // Improved hash function for better distribution
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Use a palette of highly distinct colors with -600 shade
    const colors = [
      'text-blue-600', // Blue
      'text-green-600', // Green
      'text-yellow-600', // Yellow
      'text-purple-600', // Purple
      'text-orange-600', // Orange
      'text-pink-600', // Pink
      'text-red-600', // Red
      'text-indigo-600', // Indigo
      'text-amber-600', // Amber
      'text-fuchsia-600', // Fuchsia
      'text-cyan-600', // Cyan
      'text-lime-600', // Lime (yellow-green, distinct from green)
    ]

    // Use modulo to get a consistent index
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getSeatColor = (seat: SeatValue) => {
    // Check for seats with tickets first (they may also have status)
    if (seat.ticketId && seat.ticketType) {
      return getTicketColor(seat.ticketId, seat.ticketType)
    }
    // Otherwise, treat as empty/default seat
    return 'text-gray-400'
  }

  const getSeatTitle = (
    seat: SeatValue,
    rowIndex?: number,
    colIndex?: number
  ) => {
    const seatName =
      seat.name && typeof seat.name === 'string'
        ? seat.name
        : rowIndex !== undefined && colIndex !== undefined
          ? generateSeatName(rowIndex, colIndex)
          : 'Seat'

    // Check for seats with tickets first (they may also have status)
    if (seat.ticketType) {
      return `${seatName} - ${seat.ticketType}`
    }
    // Otherwise, treat as empty/default seat
    return `${seatName} - Empty seat`
  }

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Seating Map</h1>
        <button
          onClick={() => {
            setEditing(!editing)
            setIsEditingSeats(false)
          }}
          className={cn(
            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
            !editing && 'text-[#C54B3E] hover:text-slate-700'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex items-center justify-center gap-x-2">
              Edit Seating <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>

      {editing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (Columns)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="eg: 8"
                        min="1"
                        max="100"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (Rows)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="eg: 3"
                        min="1"
                        max="100"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row and Column Names */}
            {previewMatrix.length > 0 && width > 0 && height > 0 && (
              <div className="space-y-4 rounded-md border bg-white p-4">
                <h3 className="text-sm font-semibold">Row and Column Names</h3>

                {/* Row Names */}
                <div>
                  <label htmlFor="row-names" className="mb-2 block text-sm font-medium">
                    Row Names
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                    {rowNames.slice(0, height).map((name, index) => (
                      <Input
                        key={index}
                        id={`row-name-${index}`}
                        type="text"
                        placeholder={`Row ${index + 1}`}
                        value={name}
                        onChange={(e) => {
                          const newRowNames = [...rowNames]
                          newRowNames[index] = e.target.value
                          setRowNames(newRowNames)
                        }}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Column Names */}
                <div>
                  <label htmlFor="column-names" className="mb-2 block text-sm font-medium">
                    Column Names
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                    {columnNames.slice(0, width).map((name, index) => (
                      <Input
                        key={index}
                        id={`column-name-${index}`}
                        type="text"
                        placeholder={`Col ${index + 1}`}
                        value={name}
                        onChange={(e) => {
                          const newColumnNames = [...columnNames]
                          newColumnNames[index] = e.target.value
                          setColumnNames(newColumnNames)
                        }}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enable seat editing button */}
            {previewMatrix.length > 0 && width > 0 && height > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isEditingSeats ? 'default' : 'outline'}
                  onClick={() => setIsEditingSeats(!isEditingSeats)}
                >
                  {isEditingSeats ? 'Stop Editing Seats' : 'Edit Seats'}
                </Button>
                {isEditingSeats && tickets.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No tickets available. Please create tickets first.
                  </p>
                )}
              </div>
            )}

            {/* Preview */}
            {previewMatrix.length > 0 && width > 0 && height > 0 && (
              <div className="rounded-md border bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Preview ({width} columns × {height} rows):
                </h3>
                <div className="overflow-x-auto">
                  <div className="inline-block rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
                    {/* Stage */}
                    <div className="mb-4 flex justify-center">
                      <div className="flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 px-6 py-3">
                        <span className="text-sm font-semibold text-amber-900">
                          STAGE
                        </span>
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="mb-4 flex justify-center">
                      <div className="h-px w-full bg-gray-400"></div>
                    </div>
                    {/* Seating */}
                    <div className="flex flex-col gap-2">
                      {/* Column Headers */}
                      <div className="flex justify-center gap-2">
                        <div className="h-6 w-6 flex-shrink-0"></div>
                        {previewMatrix[0]?.map((_, colIndex) => (
                          <button
                            key={colIndex}
                            type="button"
                            onClick={() => handleColumnClick(colIndex)}
                            disabled={!isEditingSeats}
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded text-xs font-semibold transition-all',
                              isEditingSeats &&
                                'cursor-pointer hover:bg-blue-100 hover:text-blue-700',
                              !isEditingSeats && 'cursor-default text-gray-700',
                              selectedColumn === colIndex &&
                                isEditingSeats &&
                                'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
                            )}
                            title={
                              isEditingSeats
                                ? `Click to select entire column ${columnNames[colIndex] || String(colIndex + 1)}`
                                : ''
                            }
                          >
                            {columnNames[colIndex] || String(colIndex + 1)}
                          </button>
                        ))}
                      </div>
                      {/* Rows with Row Labels */}
                      {previewMatrix.map((row, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex justify-center gap-2"
                        >
                          {/* Row Label */}
                          <button
                            type="button"
                            onClick={() => handleRowClick(rowIndex)}
                            disabled={!isEditingSeats}
                            className={cn(
                              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-semibold transition-all',
                              isEditingSeats &&
                                'cursor-pointer hover:bg-blue-100 hover:text-blue-700',
                              !isEditingSeats && 'cursor-default text-gray-700',
                              selectedRow === rowIndex &&
                                isEditingSeats &&
                                'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
                            )}
                            title={
                              isEditingSeats
                                ? `Click to select entire row ${rowNames[rowIndex] || String.fromCharCode(65 + rowIndex)}`
                                : ''
                            }
                          >
                            {rowNames[rowIndex] ||
                              String.fromCharCode(65 + rowIndex)}
                          </button>
                          {/* Seats */}
                          {row.map((seat: SeatValue, seatIndex: number) => (
                            <button
                              key={seatIndex}
                              type="button"
                              onClick={() =>
                                handleSeatClick(rowIndex, seatIndex)
                              }
                              disabled={!isEditingSeats}
                              className={cn(
                                'flex items-center justify-center rounded transition-all',
                                isEditingSeats &&
                                  'cursor-pointer hover:scale-110 hover:bg-gray-200',
                                !isEditingSeats && 'cursor-default',
                                selectedSeat?.row === rowIndex &&
                                  selectedSeat?.col === seatIndex &&
                                  isEditingSeats &&
                                  'ring-2 ring-blue-400 ring-offset-1'
                              )}
                              title={getSeatTitle(seat, rowIndex, seatIndex)}
                            >
                              <Square
                                className={cn(
                                  'h-6 w-6',
                                  getSeatColor(seat),
                                  isEditingSeats && 'ring-1 ring-gray-300'
                                )}
                                strokeWidth={1.5}
                                fill={seat.ticketId ? 'currentColor' : 'none'}
                              />
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Total seats: {width * height}
                </p>
              </div>
            )}

            <Button disabled={isSubmitting || !isValid}>
              Save Seating Map
            </Button>
          </form>
        </Form>
      ) : !hasSeatingMap ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          No seating map configured. Click &quot;Edit Seating&quot; to create
          one.
        </p>
      ) : (
        <div className="flex flex-col gap-y-2">
          <div className="text-muted-foreground">
            <strong>Dimensions:</strong> {seatingMap[0].length} columns ×{' '}
            {seatingMap.length} rows
          </div>
          <div className="text-muted-foreground">
            <strong>Total Seats:</strong>{' '}
            {seatingMap[0].length * seatingMap.length}
          </div>
          <div className="mt-2 rounded-md border bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold">Current Seating Map:</h3>
            <div className="overflow-x-auto">
              <div className="inline-block rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
                {/* Stage */}
                <div className="mb-4 flex justify-center">
                  <div className="flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 px-6 py-3">
                    <span className="text-sm font-semibold text-amber-900">
                      STAGE
                    </span>
                  </div>
                </div>
                {/* Divider */}
                <div className="mb-4 flex justify-center">
                  <div className="h-px w-full bg-gray-400"></div>
                </div>
                {/* Seating */}
                <div className="flex flex-col gap-2">
                  {/* Column Headers */}
                  <div className="flex justify-center gap-2">
                    <div className="h-6 w-6 flex-shrink-0"></div>
                    {seatingMap[0]?.map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="flex h-6 w-6 items-center justify-center text-xs font-semibold text-gray-700"
                      >
                        {columnNames[colIndex] || String(colIndex + 1)}
                      </div>
                    ))}
                  </div>
                  {/* Rows with Row Labels */}
                  {seatingMap.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {/* Row Label */}
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs font-semibold text-gray-700">
                        {rowNames[rowIndex] ||
                          String.fromCharCode(65 + rowIndex)}
                      </div>
                      {/* Seats */}
                      {row.map((seat, seatIndex) => (
                        <div
                          key={seatIndex}
                          className="flex items-center justify-center"
                          title={getSeatTitle(seat, rowIndex, seatIndex)}
                        >
                          <Square
                            className={cn('h-6 w-6', getSeatColor(seat))}
                            strokeWidth={1.5}
                              fill={
                                typeof seat === 'object' && seat.ticketId
                                  ? 'currentColor'
                                  : 'none'
                              }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Selection Modal */}
      <Dialog
        open={
          selectedSeat !== null ||
          selectedRow !== null ||
          selectedColumn !== null
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSeat(null)
            setSelectedRow(null)
            setSelectedColumn(null)
            setSelectedTicketId('')
            setSelectionType('seat')
          }
        }}
      >
        <DialogContent className="bg-bgColor-white">
          <DialogHeader>
            <DialogTitle>
              {selectionType === 'seat' &&
                selectedSeat &&
                `Select Ticket for Seat ${generateSeatName(selectedSeat.row, selectedSeat.col)}`}
              {selectionType === 'row' &&
                selectedRow !== null &&
                `Select Ticket for Row ${rowNames[selectedRow] || String.fromCharCode(65 + selectedRow)}`}
              {selectionType === 'column' &&
                selectedColumn !== null &&
                `Select Ticket for Column ${columnNames[selectedColumn] || String(selectedColumn + 1)}`}
            </DialogTitle>
            <DialogDescription>
              {selectionType === 'seat' &&
                'Choose a ticket type for this seat, or leave empty to clear the seat.'}
              {selectionType === 'row' &&
                `Choose a ticket type for all seats in row ${rowNames[selectedRow!] || String.fromCharCode(65 + selectedRow!)}, or leave empty to clear all seats in this row.`}
              {selectionType === 'column' &&
                `Choose a ticket type for all seats in column ${columnNames[selectedColumn!] || String(selectedColumn! + 1)}, or leave empty to clear all seats in this column.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedTicketId || undefined}
              onValueChange={setSelectedTicketId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a ticket type" />
              </SelectTrigger>
              <SelectContent>
                {tickets.map((ticket) => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    {ticket.type} - ${Number(ticket.price).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedSeat(null)
                setSelectedRow(null)
                setSelectedColumn(null)
                setSelectedTicketId('')
                setSelectionType('seat')
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleClearSeat}>
              {selectionType === 'seat' && 'Clear Seat'}
              {selectionType === 'row' && 'Clear Row'}
              {selectionType === 'column' && 'Clear Column'}
            </Button>
            <Button type="button" onClick={handleSaveTicket}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventSeating
