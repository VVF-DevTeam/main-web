'use client'
import React, { useState } from 'react'
import { EventCategory } from '@prisma/client'
import { Separator } from '@/components/ui/separator'
import EventNewCategory from './EventNewCategory'
import PreviewBadge from './PreviewBadge'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CategoryManagerProps {
  eventTags: EventCategory[]
}

const CategoryManager = ({ eventTags }: CategoryManagerProps) => {
  const [selectedTag, setSelectedTag] = useState<EventCategory | null>(null)

  const handleTagClick = (tag: EventCategory) => {
    setSelectedTag(tag)
  }

  const handleReset = () => {
    setSelectedTag(null)
  }

  return (
    <>
      {/* Section 1 */}
      <div className="flex flex-col gap-y-12 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          All Event Tags
        </h1>

        {eventTags.length === 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center">
            <p className="text-center text-sm text-muted-foreground w-full">
              No tags to show. All event tags would appear here.
            </p>
            <Button
              onClick={handleReset}
              className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm"
              size="default"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center">
            {eventTags.map((tag) => (
              <PreviewBadge
                key={tag.id}
                title={tag.title}
                isItalic={tag.isItalic}
                isBold={tag.isBold}
                bgColor={tag.bgColor}
                textColor={tag.textColor}
                helperText={null}
                onClick={() => handleTagClick(tag)}
              />
            ))}
            <Button
              onClick={handleReset}
              className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm rounded-full h-8 px-3"
              size="default"
              title="Add new tag"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Separator className="mx-auto mb-[5vh] mt-[5vh] w-[70%] bg-red-700" />

      {/* Section 2 */}
      <div className="flex flex-col gap-y-20 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          {selectedTag ? 'Edit Event Tag' : 'Create New Event Tag'}
        </h1>
        <EventNewCategory
          key={selectedTag?.id || 'new'}
          categoryId={selectedTag?.id}
          initialTitle={selectedTag?.title}
          initialType={selectedTag?.type}
          initialIsItalic={selectedTag?.isItalic}
          initialIsBold={selectedTag?.isBold}
          initialBgColor={selectedTag?.bgColor}
          initialTextColor={selectedTag?.textColor}
          onReset={handleReset}
        />
      </div>
    </>
  )
}

export default CategoryManager

