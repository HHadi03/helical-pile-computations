import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logIn} from './actions'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="h-screen bg-cover bg-center" 
    style={{backgroundImage: "url('/pageBackground.jpg')", backgroundColor: 'rgba(0, 0, 0, 0.3)', backgroundBlendMode: 'darken', backgroundRepeat: 'no-repeat'}}>
      
      <header className="bg-gray-900/90 justify-center py-2 flex items-center space-x-5 shadow-xl">
        <Image width={624} height={128} src="/logo.png" alt="Company Logo" priority={true}/>
        <h1 className="text-neutral-400 text-2xl">Helical Pile Computations</h1>
      </header>
      
       <div className="absolute right-14 top-1/3 -translate-y-1/3">
        <div className="bg-gray-900/95 p-8 rounded-lg w-96 shadow-lg">
          <form>
            <div className="pb-5">
              <label htmlFor="email" className="block text-gray-300 mb-2 text-lg">Email</label>
              <Input id="email" name="email" type="email" required placeholder="Email" className="w-full bg-gray-800 border-gray-600 text-gray-200 py-3 px-4 text-base"/>
            </div>
            
            <div className="pb-5">
              <label htmlFor="password" className="block text-gray-300 mb-2 text-lg">Password</label>
              <Input id="password" name="password" type="password" required placeholder="Password" className="w-full bg-gray-800 border-gray-600 text-gray-200 py-3 px-4 text-base"/>
            </div>
            
            <div className="space-y-5">
              <Button formAction={logIn} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-3"> Log in </Button>
              {/* <Button formAction={signUp} className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"> Sign up </Button> */}
              <button className="text-gray-400 hover:text-gray-200 text-sm">Forgotten Password? </button>
            </div>
          </form>
        </div>
      </div>

    </main>
  )
}
