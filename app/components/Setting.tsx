import Link from 'next/link'

export const Setting = () => {
  return (
    <div className='relative'>
      <div className="absolute top-0 right-0 pr-3 -mt-1">
        <Link href="/settings" className="block p-2 rounded-full hover:bg-gray-200" aria-label="Settings">
          <img src="/settings-icon.png" alt="" className="w-6 h-auto"/>
        </Link>
      </div>
    </div>
  )
}
