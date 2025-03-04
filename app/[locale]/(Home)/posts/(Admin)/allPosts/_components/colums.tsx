'use client'
import { Post } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

export const columns: ColumnDef<Post>[] = [
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
            <span className="italic text-muted-foreground">No image</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'content',
    header: () => <div className="text-center font-semibold">Content</div>,
    cell: ({ row }) => {
      const content = (row.getValue('content') as string) || null
      return (
        <div className="text-center">
          {content ? (
            <span className="text-ellipsis">{content.slice(0, 10)}....</span>
          ) : (
            <span className="italic text-muted-foreground">No Content</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'imgUrl',
    header: () => <div className="text-center font-semibold">Image</div>,
    cell: ({ row }) => {
      const image = (row.getValue('imgUrl') as string) || null
      return (
        <div className="flex-center">
          {image ? (
            <Image
              src={image}
              alt="Post Thumbnail"
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
      const updatedAt = row.getValue('updatedAt') as Date
      return (
        <div className="text-center">
          {updatedAt ? (
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
      const id = row.original.id
      return (
        <Link
          href={`/posts/editPost/${id}`}
          className="flex-center"
        >
          <Button
            variant={'default'}
            size={'sm'}
          >
            Edit
          </Button>
        </Link>
      )
    },
  },
]
