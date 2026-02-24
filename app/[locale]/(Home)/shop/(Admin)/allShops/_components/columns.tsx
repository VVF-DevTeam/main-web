'use client'

// Components
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

// Type for Shop with event relation
export type ShopWithEvent = {
  id: string
  title: string
  slug: string | null
  imageUrl: string | null
  type: string
  isPublished: boolean
  updatedAt: Date
  event?: {
    title: string
  } | null
}

// Function to create columns with optional custom edit link
export const createShopColumns = (
  editLinkPattern: string
): ColumnDef<ShopWithEvent>[] => [
  {
    accessorKey: 'title',
    header: () => <div className="text-center font-semibold">Title</div>,
    cell: ({ row }) => {
      const title = (row.getValue('title') as string) || null
      return (
        <div className="flex-center">
          {title ? (
            <span>{title}</span>
          ) : (
            <span className="italic text-muted-foreground">No title</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'slug',
    header: () => <div className="text-center font-semibold">Slug</div>,
    cell: ({ row }) => {
      const slug = (row.getValue('slug') as string) || null
      return (
        <div className="text-center">
          {slug ? (
            <span className="text-ellipsis">{slug}</span>
          ) : (
            <span className="italic text-muted-foreground">No slug</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'event',
    header: () => <div className="text-center font-semibold">Event</div>,
    cell: ({ row }) => {
      const event = row.getValue('event') as { title: string } | null
      return (
        <div className="text-center">
          {event?.title ? (
            <span className="text-ellipsis">{event.title}</span>
          ) : (
            <span className="italic text-muted-foreground">No event</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'imageUrl',
    header: () => <div className="text-center font-semibold">Image</div>,
    cell: ({ row }) => {
      const image = (row.getValue('imageUrl') as string) || null
      return (
        <div className="flex-center">
          {image ? (
            <Image
              src={image}
              alt="Shop Thumbnail"
              width={140}
              height={140}
              className="cover"
            />
          ) : (
            <span className="italic text-muted-foreground">No image</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="mx-auto flex-center font-semibold"
          aria-label="Sort by Last Updated"
        >
          Last Updated
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const updatedAtValue = row.getValue('updatedAt')
      // Convert to Date if it's a string (happens when data is serialized from server to client)
      const updatedAt = updatedAtValue
        ? new Date(updatedAtValue as string | Date)
        : null
      return (
        <div className="text-center">
          {updatedAt && !isNaN(updatedAt.getTime()) ? (
            <span className="text-slate-600">
              {updatedAt.getDate()}/{updatedAt.getMonth() + 1}/
              {updatedAt.getFullYear()}
            </span>
          ) : (
            <span className="text-muted-foreground">Not available</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'isPublished',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="mx-auto flex-center font-semibold"
          aria-label="Sort by Status"
        >
          Status
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished') as boolean
      return (
        <div className="text-center">
          {isPublished ? (
            <span className="text-green-600">Published</span>
          ) : (
            <span className="text-red-600">Draft</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const shopId = row.original.id
      // Replace {shopId} placeholder with actual shopId
      const href = editLinkPattern.replace('{shopId}', shopId)
      return (
        <Link href={href} className="flex-center">
          <Button variant={'default'} size={'sm'}>
            Edit
          </Button>
        </Link>
      )
    },
  },
]

