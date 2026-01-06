import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ServerErrorProps {
  message?: string
  showHomeButton?: boolean
}

export default function ServerError({ 
  message = "There is an error from server while getting data. Please reload the page after a few seconds",
  showHomeButton = true 
}: ServerErrorProps) {
  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-4 pt-10 text-center text-2xl pb-4">
      <h1 className="text-4xl font-bold text-red-600">Server Error</h1>
      <p className="text-lg text-gray-700">{message}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://drive.google.com/thumbnail?id=19tM0WbHYTAMlN_y8MkpYs8ZxoXUMAZYD&sz=w450"
        alt="Error"
        width={450}
        height={450}
      />
      {showHomeButton && (
        <Link
          href="/"
          className="group flex items-center gap-2 text-textColor-brand600 transition-colors duration-300 hover:text-textColor-brand900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" />
          Go Home
        </Link>
      )}
    </div>
  )
}

