'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ColorPicker, useColor } from 'react-color-palette'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import PreviewBadge from './PreviewBadge'

import 'react-color-palette/css'
import { axiosInstance } from '@/lib/axios'

interface EventNewCategoryProps {
  categoryId?: string
  initialTitle?: string
  initialType?: string
  initialIsItalic?: boolean
  initialIsBold?: boolean
  initialBgColor?: string
  initialTextColor?: string
  onReset?: () => void
}

const EventNewCategory = ({
  categoryId,
  initialTitle,
  initialType,
  initialIsItalic,
  initialIsBold,
  initialBgColor,
  initialTextColor,
  onReset,
}: EventNewCategoryProps) => {
  const [title, setTitle] = useState(initialTitle || '')
  const [categoryType, setCategoryType] = useState(initialType || '')
  const [isItalic, setIsItalic] = useState(initialIsItalic || false)
  const [isBold, setIsBold] = useState(initialIsBold || false)
  const [bgcolor, setBgColor] = useColor(initialBgColor || '#ffff')
  const [titleColor, setTitleColor] = useColor(initialTextColor || '#1A1A1A')

  const router = useRouter()

  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : { r: 255, g: 255, b: 255, a: 1 }
  }

  // Helper function to convert hex to hsv
  const hexToHsv = (hex: string) => {
    console.log(hex)
    // Simple conversion - for now just return default values
    return { h: 0, s: 0, v: 0, a: 1 }
  }

  // Update form when initial values change (when a tag is selected)
  useEffect(() => {
    if (initialTitle !== undefined) {
      setTitle(initialTitle || '')
      setCategoryType(initialType || '')
      setIsItalic(initialIsItalic || false)
      setIsBold(initialIsBold || false)
      if (initialBgColor) {
        setBgColor({ hex: initialBgColor, rgb: hexToRgb(initialBgColor), hsv: hexToHsv(initialBgColor) })
      }
      if (initialTextColor) {
        setTitleColor({ hex: initialTextColor, rgb: hexToRgb(initialTextColor), hsv: hexToHsv(initialTextColor) })
      }
    }
  }, [categoryId, initialTitle, initialType, initialIsItalic, initialIsBold, initialBgColor, initialTextColor, setBgColor, setTitleColor])

  const isDisabled = title.length === 0 || categoryType.length === 0
  const isEditMode = !!categoryId

  const saveCategory = async () => {
    if (title.length === 0 || categoryType.length === 0) return
    const data = {
      title: title,
      type: categoryType,
      isItalic: isItalic,
      isBold: isBold,
      bgColor: bgcolor.hex,
      textColor: titleColor.hex,
    }

    try {
      if (isEditMode) {
        // Update existing category
        const response = await axiosInstance.put(`/api/categories/edit/${categoryId}`, data)
        if (response.status === 200) {
          toast.success('Category updated successfully')
        }
      } else {
        // Create new category
        const response = await axiosInstance.post(`/api/categories/create`, data)
        if (response.status === 200) {
          toast.success('Category created successfully')
        }
      }
      
      // reset all states
      setTitle('')
      setCategoryType('')
      setIsItalic(false)
      setIsBold(false)
      setBgColor({ hex: '#ffff', rgb: { r: 255, g: 255, b: 255, a: 1 }, hsv: { h: 0, s: 0, v: 100, a: 1 } })
      setTitleColor({ hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26, a: 1 }, hsv: { h: 0, s: 0, v: 10, a: 1 } })
      
      // Call onReset if provided
      if (onReset) {
        onReset()
      }

      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', { description: 'Please try again later' })
    }
  }

  return (
    <div className="relative grid grid-cols-1 justify-items-center gap-y-12 md:grid-cols-2 md:place-items-start md:justify-items-start md:gap-x-6">
      {/* ------------------ Row 1 -------------------------*/}

      {/* ------------------ Column 1 -------------------------*/}
      <div className="flex flex-col gap-y-10">
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP I: Choose a title.
          </h3>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Eg: #category1"
            className="max-w-[250px] bg-slate-100 text-gray-800"
          />
        </div>
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP II: Choose category type.
          </h3>
          <Select onValueChange={setCategoryType} value={categoryType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primary">Primary</SelectItem>
              <SelectItem value="Secondary">Secondary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP III: Choose optional properties.
          </h3>
          <div className="flex gap-x-4">
            <Label htmlFor="itallic">Itallic</Label>
            <Checkbox
              checked={isItalic}
              onCheckedChange={() => setIsItalic(!isItalic)}
              id="itallic"
            />
            <Label htmlFor="bold">Bold</Label>
            <Checkbox
              checked={isBold}
              onCheckedChange={() => setIsBold(!isBold)}
              id="bold"
            />
          </div>
        </div>
      </div>

      {/* ------------------ Column 2 -------------------------*/}
      <div className="flex min-w-[350px] max-w-[350px] flex-col justify-center gap-y-6">
        <h3 className="font-semibold text-gray-600 md:text-xl">
          STEP IV: Pick a background color.
        </h3>
        <ColorPicker
          key={`bg-${categoryId || 'new'}-${initialBgColor || '#ffff'}`}
          height={130}
          color={bgcolor}
          hideInput={['rgb', 'hsv']}
          onChange={setBgColor}
          disabled={false}
        />
      </div>

      {/* ------------------ Row 2 -------------------------*/}

      {/* ------------------ Column 3 -------------------------*/}
      <div className="flex min-w-[350px] max-w-[350px] flex-col justify-center gap-y-6">
        <h3 className="font-semibold text-gray-600 md:text-xl">
          STEP V: Choose a text color.
        </h3>
        <ColorPicker
          key={`text-${categoryId || 'new'}-${initialTextColor || '#1A1A1A'}`}
          height={130}
          color={titleColor}
          hideInput={['rgb', 'hsv']}
          onChange={setTitleColor}
          disabled={false}
        />
      </div>

      {/* ------------------ Column 4 -------------------------*/}
      <PreviewBadge
        title={title.length > 0 ? title : 'Category name'}
        bgColor={bgcolor.hex}
        textColor={titleColor.hex}
        isItalic={isItalic}
        isBold={isBold}
        helperText="What it will look like"
      />

      {/* ------------------ Save Button ------------------------- */}
      <Button
        onClick={() => saveCategory()}
        className="mt-6 md:absolute md:bottom-0 md:right-0"
        disabled={isDisabled}
      >
        {isEditMode ? 'Update Category' : 'Save Changes'}
      </Button>
    </div>
  )
}

export default EventNewCategory
