'use client'

// Components
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { LogIn } from 'lucide-react'

// Libraries
import { signOutAction } from '@/lib/actions/auth/signoutAction'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

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
  const currentDateTime = getCurrentDateTime()
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')

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
        toast.success('Success', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{response.message}</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#22c55e' // green-500 color
          }
        })
      }
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: (
          <div className="flex flex-col gap-1">
            <span>Something went wrong</span>
            <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    }
  }
  return (
    <button
      onClick={() => handleAuth(userExists ? 'logout' : 'login')}
      className={cn(
        'flex items-center justify-center transition-all font-semibold whitespace-nowrap',
        mode === 'desktop'
          ? 'text-sm gap-x-[5px]'
          : 'mt-2 h-full w-full rounded-md p-4 text-xl gap-x-4',
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
