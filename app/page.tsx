import Link from 'next/link'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

export default function LandingPage() {
  return (
    //hydration issue occurs here
    <main className="min-h-screen relative bg-cover bg-center" 
      style={{backgroundImage: "url('/castle-background.jpg')", backgroundColor: 'rgba(0, 0, 0, 0.3)', backgroundBlendMode: 'darken'}}>
      
      {/* Logo/Title Section */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <img src="/logo.png" alt="Helical Pile Calculator" className="w-60 h-10" />
        <div className="text-gray-600 font-bold text-2xl">Helical Pile Computations</div>
      </div>

      {/* Login Form */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <div className="bg-gray-900/90 p-6 rounded-lg shadow-xl w-80">
          <form className="space-y-4">
            <div>
              <label className="block text-gray-200 mb-2">Username</label>
              <Input 
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 border-gray-700 text-gray-200"
              />
            </div>
            <div>
              <label className="block text-gray-200 mb-2">Password</label>
              <Input 
                type="password"
                placeholder="Password"
                className="w-full bg-gray-800 border-gray-700 text-gray-200"
              />
            </div>
            <div className="space-y-4">
              <Link href="/configuration">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
              </Link>
              <div className="text-center">
                <Link href="/forgot-password" className="text-gray-400 hover:text-gray-200 text-sm">
                  Forgotten Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
       
        
      </div>
    </main>
  )
}
