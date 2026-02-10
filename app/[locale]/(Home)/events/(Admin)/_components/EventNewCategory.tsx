'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ColorPicker, useColor, IColor } from 'react-color-palette'
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
import Loader from '@/components/loader/Loader'

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
  // Initialize with proper defaults - useColor expects a valid hex string
  const [bgcolor, setBgColor] = useColor(initialBgColor || '#ffffff')
  const [titleColor, setTitleColor] = useColor(initialTextColor || '#1A1A1A')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  // Sanitize hex coming from ColorPicker (prod bug can append "undefined")
  const sanitizeColor = (color: IColor): IColor => {
    const cleanHex = color.hex.replace(/undefined$/i, '')
    return { ...color, hex: cleanHex }
  }

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
      // Ensure hex values are clean strings (no undefined, properly formatted)
      // This fixes the production issue where ColorPicker shows "hexundefined"
      if (initialBgColor) {
        const cleanHex = String(initialBgColor).trim().replace(/undefined/gi, '').replace(/^#?/, '#')
        // Ensure it's a valid 6-digit hex
        const normalizedHex = cleanHex.length === 4 ? `#${cleanHex[1]}${cleanHex[1]}${cleanHex[2]}${cleanHex[2]}${cleanHex[3]}${cleanHex[3]}` : cleanHex.length === 7 ? cleanHex : '#ffffff'
        setBgColor({ hex: normalizedHex, rgb: hexToRgb(normalizedHex), hsv: hexToHsv(normalizedHex) })
      }
      if (initialTextColor) {
        const cleanHex = String(initialTextColor).trim().replace(/undefined/gi, '').replace(/^#?/, '#')
        const normalizedHex = cleanHex.length === 4 ? `#${cleanHex[1]}${cleanHex[1]}${cleanHex[2]}${cleanHex[2]}${cleanHex[3]}${cleanHex[3]}` : cleanHex.length === 7 ? cleanHex : '#1A1A1A'
        setTitleColor({ hex: normalizedHex, rgb: hexToRgb(normalizedHex), hsv: hexToHsv(normalizedHex) })
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
      setIsLoading(true)
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
      setBgColor({ hex: '#ffffff', rgb: { r: 255, g: 255, b: 255, a: 1 }, hsv: { h: 0, s: 0, v: 100, a: 1 } })
      setTitleColor({ hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26, a: 1 }, hsv: { h: 0, s: 0, v: 10, a: 1 } })
      
      // Call onReset if provided
      if (onReset) {
        onReset()
      }

      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', { description: 'Please try again later' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
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
            disabled={isLoading}
            className="max-w-[250px] bg-slate-100 text-gray-800"
          />
        </div>
        <div>
          <h3 className="mb-6 font-semibold text-gray-600 md:text-xl">
            STEP II: Choose category type.
          </h3>
          <Select onValueChange={setCategoryType} value={categoryType} disabled={isLoading}>
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
              disabled={isLoading}
              id="itallic"
            />
            <Label htmlFor="bold">Bold</Label>
            <Checkbox
              checked={isBold}
              onCheckedChange={() => setIsBold(!isBold)}
              disabled={isLoading}
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
          key={`bg-${categoryId || 'new'}-${initialBgColor || '#ffffff'}`}
          height={130}
          color={bgcolor?.hex ? bgcolor : { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255, a: 1 }, hsv: { h: 0, s: 0, v: 100, a: 1 } }}
          hideInput={['rgb', 'hsv']}
          onChange={(color) => setBgColor(sanitizeColor(color))}
          disabled={isLoading}
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
          color={titleColor?.hex ? titleColor : { hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26, a: 1 }, hsv: { h: 0, s: 0, v: 10, a: 1 } }}
          hideInput={['rgb', 'hsv']}
          onChange={(color) => setTitleColor(sanitizeColor(color))}
          disabled={isLoading}
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
        disabled={isDisabled || isLoading}
      >
        {isEditMode ? 'Update Category' : 'Save Changes'}
      </Button>
    </div>
    </>
  )
}

export default EventNewCategory
