'use client'
import React, { useState } from 'react'
import { Event, EventSchedule, EventCategory } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil, XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MAX_PRIMARY_TAGS = 2
const MAX_SECONDARY_TAGS = 3

interface EventCategoriesProps {
  event: Event & { schedules: EventSchedule[] } & {
    categories: EventCategory[]
  }
  categories: EventCategory[]
}

const categoryExists = (categoryId: string, categories: EventCategory[]) => {
  return categories.some((item) => item.id === categoryId)
}

const EventCategories = ({ event, categories }: EventCategoriesProps) => {
  const [primaryTags, setPrimaryTags] = useState<EventCategory[]>([])
  const [secondaryTags, setSecondaryTags] = useState<EventCategory[]>([])

  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const primaryTagsAvailable = () => {
    return (
      MAX_PRIMARY_TAGS -
      event.categories.filter((item) => item.type === 'Primary').length -
      primaryTags.length
    )
  }

  const secondaryTagsAvailable = () => {
    return (
      MAX_SECONDARY_TAGS -
      event.categories.filter((item) => item.type === 'Secondary').length -
      secondaryTags.length
    )
  }
  const saveTags = async (data: EventCategory[]) => {
    setLoading(true)

    try {
      const response = await axios.post(
        `/api/events/edit/${event.id}/categories/edit`,
        data
      )
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event categories updated successfully',
      })
      setPrimaryTags([])
      setSecondaryTags([])
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeTag = async (tagId: string) => {
    setLoading(true)
    try {
      const response = await axios.delete(
        `/api/events/edit/${event.id}/categories/edit/`,
        { data: { categoryId: tagId } }
      )
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event categories updated successfully',
      })
      setPrimaryTags([])
      setSecondaryTags([])
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Categories</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'text-gray-700 transition-all font-semibold duration-75 hover:text-red-700'
              : 'font-semibold text-red-700 transition-all duration-75 hover:text-gray-700'
          )}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <span className="flex gap-x-2">
              Edit <Pencil className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>

      <div>
        {isEditing ? (
          <div>
            <p className="mb-6 text-center text-muted-foreground text-slate-500">
              Choose your primary and secondary tags.
            </p>
            <div className="mb-12 flex justify-around gap-y-4">
              {/* Dropdown list for tags selection */}

              {/* Primary Tags */}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md bg-gray-300 px-2 py-1 text-slate-950 hover:bg-gray-400">
                  Primary tags
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28 bg-gray-200">
                  <DropdownMenuLabel>
                    Tags remaining : {primaryTagsAvailable()}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories
                    .filter((item) => item.type === 'Primary')
                    .map((category) => {
                      return (
                        <DropdownMenuCheckboxItem
                          className="cursor-pointer hover:bg-gray-200/80"
                          key={category.id}
                          checked={
                            categoryExists(category.id, event.categories) ||
                            categoryExists(category.id, primaryTags)
                          }
                          onCheckedChange={(checked) =>
                            checked
                              ? !categoryExists(category.id, primaryTags) &&
                                setPrimaryTags([...primaryTags, category])
                              : setPrimaryTags(
                                  primaryTags.filter(
                                    (ctg) => ctg.id !== category.id
                                  )
                                )
                          }
                          disabled={primaryTagsAvailable() === 0}
                        >
                          <Badge
                            style={{
                              backgroundColor: category.bgColor,
                              color: category.textColor,
                            }}
                            className="mx-auto rounded-2xl px-2 py-1"
                          >
                            {category.title}
                          </Badge>
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Secondary tags */}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md bg-gray-300 px-2 py-1 text-slate-950 hover:bg-gray-400">
                  Secondary tags
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28 bg-gray-100">
                  <DropdownMenuLabel>
                    Tags remaining : {secondaryTagsAvailable()}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories
                    .filter((item) => item.type === 'Secondary')
                    .map((category) => (
                      <DropdownMenuCheckboxItem
                        className="cursor-pointer hover:bg-gray-200/80"
                        checked={
                          categoryExists(category.id, event.categories) ||
                          categoryExists(category.id, secondaryTags)
                        }
                        onCheckedChange={(checked) =>
                          checked
                            ? !categoryExists(category.id, secondaryTags) &&
                              setSecondaryTags([...secondaryTags, category])
                            : setSecondaryTags(
                                secondaryTags.filter(
                                  (ctg) => ctg.id !== category.id
                                )
                              )
                        }
                        disabled={secondaryTagsAvailable() === 0}
                        key={category.id}
                      >
                        <Badge
                          style={{
                            backgroundColor: category.bgColor,
                            color: category.textColor,
                          }}
                          className="mx-auto rounded-2xl px-2 py-1"
                        >
                          {category.title}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Display tgs that have already been saved in the database, than can removed from the events */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-x-3">
              {event.categories.map((category) => (
                <div className="flex" key={category.id}>
                  <Badge
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.textColor,
                    }}
                    className="mx-auto rounded-2xl px-3 py-2"
                  >
                    {category.title}
                  </Badge>
                  <XIcon
                    onClick={() => removeTag(category.id)}
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm italic text-muted-foreground text-slate-500">
                  Tags selected : {event.categories.length}
                </p>
                <p className="text-sm italic text-muted-foreground text-slate-500">
                  Tags remaining : {5 - event.categories.length}
                </p>
              </div>
              <Button
                className="ml-auto"
                onClick={() => saveTags([...primaryTags, ...secondaryTags])}
                disabled={
                  loading || primaryTags.length + secondaryTags.length === 0
                }
              >
                Save Tags
              </Button>
            </div>
          </div>
        ) : event.categories.length === 0 ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add event event categories.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-2">
            {event.categories.map((category) => (
              <Badge
                key={category.id}
                style={{
                  backgroundColor: category.bgColor,
                  color: category.textColor,
                }}
                className="mx-auto rounded-2xl px-2 py-1"
              >
                {category.title}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCategories
