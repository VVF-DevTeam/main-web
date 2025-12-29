'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface GuestInfo {
  name: string
  email: string
  phone: string
}

interface GuestInfoFormProps {
  onSubmit: (info: GuestInfo) => void
  initialEmail?: string
  buttonText?: string
}

export default function GuestInfoForm({
  onSubmit,
  initialEmail = '',
  buttonText,
}: GuestInfoFormProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['signIn-signUp', 'event'])
  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState('')
  const [phoneExtension, setPhoneExtension] = useState<string>('+1')
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
  }>({})

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // Combine extension and phone number
      const fullPhone = phone.trim() ? `${phoneExtension}${phone.trim()}` : ''
      onSubmit({ 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        phone: fullPhone 
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guest-name">
          {t('signIn-signUp:firstName')} & {t('signIn-signUp:lastName')}
        </Label>
        <Input
          id="guest-name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors({ ...errors, name: undefined })
          }}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-email">{t('signIn-signUp:email')}</Label>
        <Input
          id="guest-email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors({ ...errors, email: undefined })
          }}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-phone">{t('signIn-signUp:phoneNumber')}</Label>
        <div className="flex">
          <Select
            value={phoneExtension}
            onValueChange={setPhoneExtension}
          >
            <SelectTrigger className="w-28 rounded-r-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+1">(🇨🇦) +1</SelectItem>
              <SelectItem value="+84">(🇻🇳) +84</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="guest-phone"
            type="tel"
            placeholder="eg: 1234567890"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (errors.phone) setErrors({ ...errors, phone: undefined })
            }}
            className={`rounded-l-none ${errors.phone ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full group">
          {buttonText || t('event:reserve-button')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t('event:guest-checkout-disclaimer')}
      </p>
    </form>
  )
}


