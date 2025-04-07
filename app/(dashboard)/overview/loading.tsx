import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg shadow-lg">
        <Loader2 className="h-12 w-12 animate-spin text-gray-600" />
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  )
}
