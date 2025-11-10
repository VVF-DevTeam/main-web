'use client'

// Components
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
// import { LogIn, LogOut } from 'lucide-react'

// Libraries
import { signOutAction } from '@/lib/actions/auth/signoutAction'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Link from 'next/link'
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
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        })
      }
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: (
          <div className="flex flex-col gap-1">
            <span>Something went wrong</span>
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
    <div className="flex items-center justify-center gap-x-4 lg:ml-[2vw] xl:ml-[5vw]">
      {!userExists && (
        <Link href="/signUp">
          <button
            className={cn(
              'hidden items-center justify-center whitespace-nowrap rounded-md px-6 py-[10px] text-xl text-textColor-brand900 hover:underline  transition-all lg:flex',
              mode === 'desktop'
                ? 'gap-x-[5px]'
                : 'mt-2 h-full w-full gap-x-4 rounded-md p-4'
            )}
          >
            <span>{t('signUp-nav', { ns: 'homePage' })}</span>
          </button>
        </Link>
      )}

      <button
        onClick={() => handleAuth(userExists ? 'logout' : 'login')}
        className={cn(
          ' items-center justify-center whitespace-nowrap rounded-md max-w-[120px] h-[28px] py-5 px-4 lg:px-12 text-lg text-textColor-white transition-all',
          mode === 'desktop'
            ? 'bg-bgColor-brand900'
            : 'mt-2 h-full w-full gap-x-4 rounded-md p-4',
          isActive
            ? 'hidden'
            : mode === 'desktop'
              ? 'flex hover:bg-bgColor-brand900/80'
              : 'flex hover:bg-bgColor-brand900'
        )}
      >
        <span>
          {userExists
            ? t('logout-nav', { ns: 'homePage' })
            : t('login-nav', { ns: 'homePage' })}
        </span>
      </button>
    </div>
  )
}

export default AuthButtons
