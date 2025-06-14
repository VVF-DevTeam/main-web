'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { deleteUser } from '@/lib/actions/user/deleteUser'
import { useRouter } from 'next/navigation'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

const deleteAccountSchema = z.object({
  confirmationText: z
    .string() // ✅ Now allows any string
    .refine((val) => val === 'DELETE', {
      message: "Please type 'DELETE' to delete your account",
    }),
  password: z.string().min(1, 'Password is required'),
})

type DeleteAccountFormValues = {
  confirmationText: string
  password: string
}

const DeleteForm = ({
  user,
}: {
  user: { email: string; password: string | null }
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmationText: '',
      password: '',
    },
  })

  const onSubmit = async (data: DeleteAccountFormValues) => {
    try {
      if (!user?.email) {
        toast.error('User email is missing', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Please check your email and try again later.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
        return
      }

      const requestData = {
        email: user.email,
        password: data.password,
      }

      const response = await deleteUser(requestData)

      if (response.success) {
        toast.success(t('account-deleted'), {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        })
        router.replace('/')
      } else {
        toast.error(response.message || t('delete-account-failed'), {
          description: (
            <div className="flex flex-col gap-1">
              <span>
                Please try again later or contact support for assistance.
              </span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(t('delete-account-failed'), {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              An error occurred while deleting your account. Please try again
              later or contact support for assistance.
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    }
  }

  return (
    <div className="flex max-w-2xl flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-32">
      <h1 className="text-textColor-black text-xl font-semibold md:text-3xl lg:mt-12">
        {t('delete-account')}
      </h1>
      <p className="mt-6 font-medium">{t('delete-account-message')}</p>

      {/* Confirmation Input Box with Responsive Titles */}
      <p className="mt-6 font-medium">{t('delete-account-confirmation')}</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-y-6 pt-2 md:grid-cols-1"
        >
          <FormField
            control={form.control}
            name="confirmationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('type-delete-title')}</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="DELETE" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('enter-password-title')}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 mt-6 flex justify-center">
            <Button type="submit" variant="destructive">
              {t('delete-account')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default DeleteForm
