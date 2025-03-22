'use client'

// Components
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { LogIn } from 'lucide-react'

// Libraries
import { signOutAction } from '@/lib/actions/signoutAction'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// Interfaces
interface AuthButtonProps {
  userExists: boolean
  mode: string
}

// Main Component
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
        'flex-center transition-all font-semibold whitespace-nowrap',
        mode === 'desktop'
          ? 'gap-x-2 text-sm'
          : 'mt-2 h-full w-full gap-x-4 rounded-md p-4 text-xl',
        isActive
          ? 'text-textColor-brand'
          : mode === 'desktop'
          ? 'text-textColor hover:text-textColor-brand hover:underline'
          : 'text-slate-200 hover:bg-bgColor-brand'
      )}
    >
      <LogIn className="h-5 w-5" />
      <span>
        {userExists
          ? t('logout-nav', { ns: 'homePage' })
          : t('login-nav', { ns: 'homePage' })}
      </span>
    </button>
  )
}

export default AuthButtons
