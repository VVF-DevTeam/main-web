'use client'

import { useState } from 'react'

interface PaymentNoteButtonProps {
  note: string | null
}

export default function PaymentNoteButton({ note }: PaymentNoteButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const hasNote = !!note?.trim()

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Note</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {note?.trim() || 'No note provided.'}
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={!hasNote}
        className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          hasNote
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'cursor-not-allowed bg-gray-100 text-gray-400'
        }`}
      >
        View Note
      </button>
    </>
  )
}
