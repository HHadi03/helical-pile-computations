import { Skeleton } from "../components/ui/skeleton"

export default function Loading() {
  return (
    <div>
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-transparent animate-spin"></div>
    </div>
   </div>
  )
}
