export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="relative">
        <div className="size-15 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 size-15 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
      </div>
    </div>
  )
}