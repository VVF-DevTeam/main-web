'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { changePassword } from '@/lib/actions/changePassword'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

import { passwordSchema } from '@/lib/zodSchema/passwordSchema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

type PasswordFormValues = z.infer<typeof passwordSchema>

const PasswordForm = ({
  user,
}: {
  user: { email: string; password: string | null }
}) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    repeatPassword: false,
  })

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      repeatPassword: '',
    },
  })

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }
  const onSubmit = async (data: PasswordFormValues) => {
    try {
      const result = await changePassword({
        email: user.email,
        currentPassword: user.password ? data.currentPassword : '',
        newPassword: data.newPassword,
      })

      if (result.success) {
        toast({ title: 'Success', description: t('password-success') })
        form.reset()
      } else {
        toast({
          title: 'Error',
          description: result.message || t('password-failed'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('API Call Failed:', error)
      toast({
        title: 'Error',
        description: t('password-failed'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex max-w-xl flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-32">
      <h1 className="text-xl font-semibold text-[#C54B3E] md:text-3xl lg:mt-12">
        {t('password-header')}
      </h1>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log('🛠 Form is being submitted')
            form.handleSubmit((data) => {
              console.log('🚀 onSubmit is running! Data:', data)
              onSubmit(data)
            })(e)
          }}
          className="grid gap-y-6 pt-2 md:grid-cols-1"
        >
          {user.password && (
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('current-password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={
                          showPassword.currentPassword ? 'text' : 'password'
                        }
                        {...field}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          togglePasswordVisibility('currentPassword')
                        }
                      >
                        {showPassword.currentPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('new-password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword.newPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      {showPassword.newPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirm-password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword.repeatPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('repeatPassword')}
                    >
                      {showPassword.repeatPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 mt-6 flex justify-center">
            <Button
              type="submit"
              className="bg-[#C54B3E] text-white hover:bg-[#C54B3E]/80"
            >
              {t('Save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PasswordForm
