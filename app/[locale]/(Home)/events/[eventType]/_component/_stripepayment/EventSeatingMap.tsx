'use client'

import { Armchair } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    SeatingMap,
    SeatValue,
} from '../../../(Admin)/editEvent/[eventKeyName]/_components/EventSeating'
import { SEAT_STATUS } from '../../../(Admin)/editEvent/[eventKeyName]/_components/EventSeating'

interface EventSeatingMapProps {
    seatingMap: SeatingMap
    columnNames: string[]
    rowNames: string[]
    selectedSeat: {
        seat: SeatValue
        rowIndex: number
        seatIndex: number
    } | null
    isSeatSelected: (rowIndex: number, seatIndex: number) => boolean
    handleSeatClick: (seat: SeatValue, rowIndex: number, seatIndex: number) => void
    handleSeatKeyDown: (
        event: React.KeyboardEvent<HTMLDivElement>,
        seat: SeatValue,
        rowIndex: number,
        seatIndex: number
    ) => void
    getSeatTitle: (seat: SeatValue, rowIndex: number, colIndex: number) => string
    getSeatColor: (seat: SeatValue) => string
    seatLegendItems: Array<{
        key: string
        label: string
        description: string
        iconClass: string
        wrapperClass?: string
    }>
}

const EventSeatingMap = ({
    seatingMap,
    columnNames,
    rowNames,
    selectedSeat,
    isSeatSelected,
    handleSeatClick,
    handleSeatKeyDown,
    getSeatTitle,
    getSeatColor,
    seatLegendItems,
}: EventSeatingMapProps) => {
    return (
        <div className="w-full">
            <div className="rounded-md border bg-white p-4">
                <h3 className="web_h3 mb-2 text-center text-base font-semibold sm:text-lg md:text-xl">
                    Seating Map
                </h3>
                <div className="w-full overflow-x-auto">
                    <div className="flex w-full md:justify-center">
                        <div className="inline-block rounded-lg border-2 border-gray-300 bg-gray-50 p-3">
                            {/* Stage */}
                            <div className="mb-4 flex justify-center">
                                <div className="flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 px-6 py-1">
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
                            <div className="flex flex-col gap-1.5">
                                {/* Column Headers */}
                                <div className="flex justify-center md:gap-1">
                                    <div className="h-6 w-6 flex-shrink-0 sm:h-8 sm:w-7"></div>
                                    {seatingMap[0]?.map((_, colIndex) => (
                                        <div
                                            key={colIndex}
                                            className="flex h-6 w-6 items-center justify-center text-[10px] font-semibold text-gray-700 sm:h-8 sm:w-7 sm:text-xs"
                                        >
                                            {columnNames[colIndex] || String(colIndex + 1)}
                                        </div>
                                    ))}
                                </div>
                                {/* Rows with Row Labels */}
                                {seatingMap.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="flex justify-center md:gap-1"
                                    >
                                        {/* Row Label */}
                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-[10px] font-semibold text-gray-700 sm:h-8 sm:w-7 sm:text-xs">
                                            {rowNames[rowIndex] ||
                                                String.fromCharCode(65 + rowIndex)}
                                        </div>
                                        {/* Seats */}
                                        {row.map((seat, seatIndex) => {
                                            const isActiveSeat =
                                                selectedSeat?.rowIndex === rowIndex &&
                                                selectedSeat?.seatIndex === seatIndex
                                            const isSeatUnavailable =
                                                seat.status === SEAT_STATUS.OCCUPIED
                                            const isInCart = isSeatSelected(rowIndex, seatIndex)
                                            return (
                                                <div
                                                    key={seatIndex}
                                                    role="button"
                                                    tabIndex={isSeatUnavailable ? -1 : 0}
                                                    aria-pressed={isActiveSeat || isInCart}
                                                    aria-disabled={isSeatUnavailable}
                                                    aria-label={getSeatTitle(seat, rowIndex, seatIndex)}
                                                    onClick={() => {
                                                        if (isSeatUnavailable) return
                                                        handleSeatClick(seat, rowIndex, seatIndex)
                                                    }}
                                                    onKeyDown={
                                                        isSeatUnavailable
                                                            ? undefined
                                                            : (event) =>
                                                                handleSeatKeyDown(event, seat, rowIndex, seatIndex)
                                                    }
                                                    className={cn(
                                                        'relative flex h-6 w-6 items-center justify-center rounded p-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 sm:h-7 sm:w-7',
                                                        isSeatUnavailable
                                                            ? 'cursor-not-allowed'
                                                            : 'cursor-pointer hover:bg-gray-300',
                                                        isActiveSeat ? 'bg-gray-200' : '',
                                                        isInCart
                                                            ? 'bg-primary/10 ring-2 ring-primary ring-offset-1'
                                                            : ''
                                                    )}
                                                    title={getSeatTitle(seat, rowIndex, seatIndex)}
                                                >
                                                    <Armchair
                                                        className={cn(
                                                            'h-4 w-4 sm:h-5 sm:w-5',
                                                            getSeatColor(seat),
                                                            isInCart && 'scale-110'
                                                        )}
                                                        strokeWidth={isInCart ? 2.5 : 2}
                                                    />
                                                    {isInCart && (
                                                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                    {seatLegendItems.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1"
                        >
                            <div
                                className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded md:h-8 md:w-8',
                                    item.wrapperClass
                                )}
                            >
                                <Armchair
                                    className={cn('h-4 w-4 md:h-5 md:w-5', item.iconClass)}
                                />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-medium text-gray-800">{item.label}</span>
                                <span className="text-xs text-gray-500">{item.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default EventSeatingMap