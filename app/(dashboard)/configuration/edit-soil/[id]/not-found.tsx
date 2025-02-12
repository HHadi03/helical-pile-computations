import Link from 'next/link'

export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600">The page you are looking for does not exist.</p>
        <Link href="/Overview">Return to Dashboard</Link>
      </div>
    )
  }

