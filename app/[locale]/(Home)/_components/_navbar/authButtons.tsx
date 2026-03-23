'use client'

// Components
import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User2, LogOut, ChevronDown } from 'lucide-react'
import Image from 'next/image'

// Libraries
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Link from 'next/link'
// Main Component
const AuthButtons = ({ mode }: { mode: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname.includes('signIn')
  const currentDateTime = getCurrentDateTime()
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')
  const { status, data: session } = useSession()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userExists = status === 'authenticated'


  const handleAuth = (type: 'login' | 'logout') => {
    if (type === 'login') {
      router.push('/signIn')
    } else {
      logout()
    }
  }
  const logout = async () => {
    try {
      // Use client-side signOut to properly update SessionProvider state
      await signOut({ redirect: false })
      toast.success('Success', {
        description: (
          <div className="flex flex-col gap-1">
            <span>Signed out successfully</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
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
    <div className="flex items-center justify-center gap-x-4 lg:ml-[2vw]">
      {!userExists && (
        <Link
          href="/signUp"
          className={cn(
            'hidden items-center justify-center whitespace-nowrap rounded-md px-2 py-[10px] text-xl text-textColor-brand900 transition-all hover:underline lg:flex',
            mode === 'desktop' ? 'gap-x-[5px]' : 'mt-2 h-full w-full gap-x-4 rounded-md p-4'
          )}
        >
          <span>{t('signUp-nav', { ns: 'homePage' })}</span>
        </Link>
      )}

      {!userExists && (
        mode === 'mobile' ? (
          <div className="mt-2 flex w-full items-center text-lg mr-8">
            <button
              onClick={() => handleAuth('login')}
              className="flex flex-1 items-center justify-center gap-x-4 rounded-md p-4 px-5 text-white transition-all hover:bg-bgColor-brand900/50 whitespace-nowrap"
            >
              {t('login-nav', { ns: 'homePage' })}
            </button>
            <span className="text-textColor-white">|</span>
            <Link
              href="/signUp"
              className="flex flex-1 items-center justify-center gap-x-4 rounded-md p-4 px-5 text-white transition-all hover:bg-bgColor-brand900/50 whitespace-nowrap"
            >
              {t('signUp-nav', { ns: 'homePage' })}
            </Link>
          </div>
        ) : (
          <button
            onClick={() => handleAuth('login')}
            className={cn(
              'h-[28px] max-w-[120px] items-center justify-center whitespace-nowrap rounded-md px-4 py-5 text-lg text-textColor-white transition-all lg:px-6 bg-bgColor-brand900',
              isActive ? 'hidden' : 'flex hover:bg-bgColor-brand900/80'
            )}
          >
            <span>{t('login-nav', { ns: 'homePage' })}</span>
          </button>
        )
      )}

      {userExists && mode === 'mobile' && (
        <>
          <Link
            href="/profile"
            className="mt-2 flex h-full w-full items-center gap-x-4 rounded-md p-4 text-slate-200 hover:bg-bgColor-brand900/50"
            aria-label="Go to user profile"
          >
            <User2 className="h-5 w-5" />
            <span>{session?.user?.name?.split(' ')[0]}</span>
          </Link>
          <button
            onClick={() => logout()}
            className="mt-2 flex h-full w-full items-center gap-x-4 rounded-md p-4 text-slate-200 hover:bg-bgColor-brand900/50"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('logout-nav', { ns: 'homePage' })}</span>
          </button>
        </>
      )}

      {userExists && mode !== 'mobile' && (
        <div
          ref={profileRef}
          className="relative"
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current)
            setIsProfileOpen(true)
          }}
          onMouseLeave={() => {
            closeTimer.current = setTimeout(() => setIsProfileOpen(false), 1000)
          }}
        >
          <Link
            href="/profile"
            className="flex-center gap-x-[5px] text-textColor transition-all hover:text-textColor-brand900"
            aria-label="Go to user profile"
          >
            <User2 className="h-5 w-5" />
            <span>{session?.user?.name?.split(' ')[0]}</span>
            <ChevronDown className={`lg:h-4 lg:w-4 h-3 w-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </Link>

          <div
            className={cn(
              'absolute right-0 lg:-right-12 z-50 mt-2 w-96 rounded-md border border-gray-200 bg-white shadow-lg transition-all',
              isProfileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              {/* Left: avatar + name + email */}
              <Link
                href="/profile"
                className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      <User2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textColor">
                    {session?.user?.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </Link>

              {/* Right: sign out */}
              <button
                onClick={() => logout()}
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-red-500"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout-nav', { ns: 'homePage' })}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthButtons
