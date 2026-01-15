import { Loader2 } from 'lucide-react'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Loader2 className="h-10 w-10 animate-spin text-bgColor-brand900" />
    </div>
  )
}