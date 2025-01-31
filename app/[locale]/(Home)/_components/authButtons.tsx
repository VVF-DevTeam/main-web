'use client'
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { LogIn } from 'lucide-react'
import { signOutAction } from '@/lib/actions/signoutAction'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface AuthButtonProps {
  userExists: boolean
  mode: string
}
const AuthButtons = ({ userExists, mode }: AuthButtonProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname.includes('signIn')
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
      className={cn(
        mode === 'desktop'
          ? `flex items-center justify-center gap-x-2 whitespace-nowrap text-sm font-semibold transition-all ${isActive ? 'text-[#C54B3E]' : 'text-[#212121] hover:text-[#C54B3E] hover:underline'}`
          : `mt-2 flex h-full w-full items-center justify-center gap-x-4 whitespace-nowrap rounded-md p-4 text-xl font-semibold transition-all ${isActive ? 'text-[#C54B3E]' : 'text-slate-200 hover:bg-[#620BC4]'}`
      )}
    >
      <LogIn className="h-5 w-5" />
      <span>{userExists ? t('logout-nav') : t('login-nav')}</span>
    </button>
  )
}

export default AuthButtons
