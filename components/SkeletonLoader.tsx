import { Skeleton } from "./ui/skeleton"
export const SkeletonLoader = () => {
  return (
    <div className="w-full space-y-6">

      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="flex items-center">
        <Skeleton className="h-7 w-48" />
      </div>

      <div className="rounded-t-lg bg-slate-100 p-3">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="border-b p-3">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}
    