import Link from 'next/link'

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold">404 - Entry Not Found</h1>
      <p className="text-lg text-gray-600">The Entry you are looking for does not exist.</p>
      <Link href="/configuration">Return to Configuration</Link>
    </div>
  )
}

