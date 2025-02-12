'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next' // Assuming you're using i18next for translations

const DeleteAccount = ({ user }: { user: any }) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation()

  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (confirmationText !== 'DELETE') {
      setError(t('error-delete-confirmation') || 'Please type "CLOSE" to confirm account deletion.')
      return
    }
    if (!password) {
      setError(t('error-enter-password') || 'Please enter your password to proceed.')
      return
    }
    // API call
  

  }

  return (
    <div className="p-6 sm:p-6 lg:p-10">
      <h1 className="mb-6 text-2xl font-bold text-[#1E0A3C]">
        {t('delete-account')}
      </h1>
      <hr className="mb-6 border-t border-[#EEEDF2]" />

      {/* Error Banner */}
      {error && (
        <div className="mb-4 w-full bg-[#C5162E] px-6 py-4 text-white rounded">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="mb-4 w-full bg-[#1B8900] px-6 py-4 text-white rounded">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-white hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700">{t('delete-account-message')}</p>

        {/* Confirmation Input Box with Responsive Titles */}
        <p className="mt-6 font-medium">{t('delete-account-confirmation')}</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4 border border-[#EEEDF2] p-4 rounded-lg">
            {/* Type "CLOSE" */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
              <label className="w-full sm:w-48 text-sm font-medium text-[#1E0A3C]">
                {t('type-delete-title') || 'Type "CLOSE":'}
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full sm:flex-1 rounded border p-2 text-gray-700"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
              <label className="w-full sm:w-48 text-sm font-medium text-[#1E0A3C]">
                {t('enter-password-title') || 'Enter your password:'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full sm:flex-1 rounded border p-2 text-gray-700"
              />
            </div>
          </div>

          {/* Delete Button */}
          <button
            type="submit"
            className="mt-6 w-full rounded bg-[#D9381E] px-6 py-2 text-white hover:bg-[#B22C16] transition"
          >
            {t('delete-account') || 'Delete Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DeleteAccount
