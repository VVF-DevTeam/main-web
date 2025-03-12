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
import { useToast } from '@/hooks/use-toast'
import { deleteUser } from '@/lib/actions/deleteUser'
import { useRouter } from 'next/navigation'

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
  const { t } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
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
        toast({
          title: 'Error',
          description: 'User email is missing',
          variant: 'destructive',
        })
        return
      }

      const requestData = {
        email: user.email,
        password: data.password,
      }

      const response = await deleteUser(requestData)

      if (response.success) {
        toast({ title: 'Success', description: t('account-deleted') })
        router.replace('/')
      } else {
        toast({
          title: 'Error',
          description: response.message || t('delete-account-failed'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: t('delete-account-failed'),
        variant: 'destructive',
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
            <Button
              type="submit"
              className="bg-bgColor-brand text-textColor-white hover:bg-bgColor-brandLight"
            >
              {t('delete-account')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default DeleteForm
