'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
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
const NewCategory = () => {
  const [title, setTitle] = useState('')
  const [categoryType, setCategoryType] = useState('')
  const [isItalic, setIsItalic] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [bgcolor, setBgColor] = useColor('#ffff')
  const [titleColor, setTitleColor] = useColor('#1A1A1A')

  const router = useRouter()
  const { toast } = useToast()

  const isDisabled = title.length === 0 || categoryType.length === 0

  const createCategory = async () => {
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
      const response = await axiosInstance.post(`/api/categories/create`, data)
      if (response.status === 200) {
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Category created successfully',
        })
      }
      // reset all states
      setTitle('')
      setCategoryType('')
      setIsItalic(false)
      setIsBold(false)

      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
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
          <Select onValueChange={setCategoryType}>
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
        onClick={() => createCategory()}
        className="mt-6 md:absolute md:bottom-0 md:right-0"
        disabled={isDisabled}
      >
        Save Changes
      </Button>
    </div>
  )
}

export default NewCategory
