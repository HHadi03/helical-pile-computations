import Image from 'next/image'
import { LoginForm } from './LoginForm'

export default function LandingPage() {
  return (
    <main className="h-screen overflow-y-auto overflow-x-clip">

        <Image 
        src='/pageBackground.jpg' 
        alt='Background' 
        width={1920}
        height={948}
        
        className=' -z-10'
      />
      
      <header className="bg-background dark:bg-secondary p-3 flex flex-col items-center space-y-2 shadow-lg sm:flex-row sm:space-y-0 sm:gap-5 sm:justify-center">
        <Image src='/logo.png' alt='Company Logo' width={624} height={128}/>
        <h1 className="text-xl text-foreground/85 whitespace-nowrap">Helical Pile Computations</h1>
      </header>

      <div className="flex justify-center sm:justify-end px-5 mt-15 mb-5 sm:pr-20">
        <LoginForm />
      </div>
      
    </main>
  )
}
