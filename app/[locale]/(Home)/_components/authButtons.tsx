'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { LogIn } from 'lucide-react'
import { signOutAction } from '@/lib/actions/signoutAction'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

interface AuthButtonProps {
  userExists: boolean
}
const AuthButtons = ({ userExists }: AuthButtonProps) => {
  const router = useRouter()
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  const handleAuth = (type: 'login' | 'logout') => {
    if (type === 'login') {
      router.push('/signIn')
    } else {
      logout()
    }
  }
  const logout = async () => {
    try {
      const response: ServerActionResponse = await signOutAction()
      if (response.success) {
        toast({
          variant: 'default',
          title: 'Success',
          description: response.message,
        })
      }
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
    <button
      onClick={() => handleAuth(userExists ? 'logout' : 'login')}
      className="flex items-center justify-center gap-x-2 text-[#1B171A] transition-all hover:text-[#1B171A]/70"
    >
      <LogIn className="h-6 w-8" />
      <span>{userExists ? t('logout-nav') : t('login-nav')}</span>
    </button>
  )
}

export default AuthButtons
