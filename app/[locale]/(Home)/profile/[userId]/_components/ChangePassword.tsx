'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/actions/changePassword'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
interface userPasswordProps {
  email: string
  password: string | null
}

const Password = ({ user }: { user: userPasswordProps }) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  })
  const [error, setError] = useState<string | null>('')
  const [success, setSuccess] = useState<string | null>('')
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    repeatPassword: false,
  })
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    repeatPassword: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const getFieldStyle = (field: keyof typeof passwords) => {
    const isNewOrRepeatWithError =
      (field === 'newPassword' || field === 'repeatPassword') &&
      touched[field] &&
      passwords[field].length < 8
    const hasError =
      touched[field] && (!passwords[field] || isNewOrRepeatWithError)
    return {
      border: hasError ? '1px solid #C5162E' : '1px solid #DBDAE3',
      borderRadius: '2px',
      padding: '8px 12px',
      width: '100%',
      marginTop: '4px',
      fontSize: '14px',
      outline: 'none',
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({
      currentPassword: true,
      newPassword: true,
      repeatPassword: true,
    })

    if (user.password && !passwords.currentPassword) {
      setError(t('currentpassword-warning'))
      return
    }

    if (passwords.newPassword.length < 8) {
      setError(t('newpassword-warning'))
      return
    }

    if (passwords.newPassword !== passwords.repeatPassword) {
      setError(t('passwordmatch-warning'))
      return
    }

    try {
      const result = await changePassword({
        email: user.email,
        currentPassword: user.password ? passwords.currentPassword : '',
        newPassword: passwords.newPassword,
      })

      if (result.success) {
        setSuccess(t('password-success'))
        setPasswords({
          currentPassword: '',
          newPassword: '',
          repeatPassword: '',
        })
        setTouched({
          currentPassword: false,
          newPassword: false,
          repeatPassword: false,
        })
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.log(error)
      setError(t('password-failed'))
    }
  }

  return (
    <div className="flex w-full flex-col">
      {/* Error Banner */}

      {error && (
        <div className="w-full bg-[#C5162E] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-white hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}

      {success && (
        <div className="w-full bg-[#1B8900] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="text-white hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-6 lg:p-10">
        <h1 className="mb-6 text-2xl font-bold text-[#1E0A3C]">
          {t('password-header')}
        </h1>
        <hr className="mb-6 border-t border-[#EEEDF2]" />
        <p className="mb-6 text-[#6F7287]">{t('password-command')}</p>

        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          {user.password && (
            <div>
              <label className="block">
                <div className="flex items-center">
                  <span className="text-sm text-[#1E0A3C]">
                    {t('current-password')}
                  </span>
                  <span className="ml-1 text-[#C5162E]">*</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword.currentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('currentPassword')}
                    style={getFieldStyle('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287]"
                  >
                    {showPassword.currentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {touched.currentPassword && !passwords.currentPassword && (
                  <p className="mt-1 text-sm text-[#C5162E]">
                    {t('currentpassword-warning')}
                  </p>
                )}
              </label>
            </div>
          )}

          <div>
            <label className="block">
              <div className="flex items-center">
                <span className="text-sm text-[#1E0A3C]">
                  {t('new-password')}
                </span>
                <span className="ml-1 text-[#C5162E]">*</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('newPassword')}
                  style={getFieldStyle('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287]"
                >
                  {showPassword.newPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {touched.newPassword && passwords.newPassword.length < 8 && (
                <p className="mt-1 text-sm text-[#C5162E]">
                  {t('newpassword-warning')}
                </p>
              )}
            </label>
          </div>

          <div>
            <label className="block">
              <div className="flex items-center">
                <span className="text-sm text-[#1E0A3C]">
                  {t('confirm-password')}
                </span>
                <span className="ml-1 text-[#C5162E]">*</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword.repeatPassword ? 'text' : 'password'}
                  name="repeatPassword"
                  value={passwords.repeatPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('repeatPassword')}
                  style={getFieldStyle('repeatPassword')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('repeatPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7287]"
                >
                  {showPassword.repeatPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {touched.repeatPassword &&
                passwords.repeatPassword.length < 8 && (
                  <p className="mt-1 text-sm text-[#C5162E]">
                    {t('repeatpassword-warning')}
                  </p>
                )}
            </label>
          </div>

          <p className="text-sm text-[#6F7287]">{t('password-warning')}</p>

          <button
            type="submit"
            className="rounded bg-[#D1410C] px-6 py-3 text-white hover:bg-[#B23609]"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

export default Password
