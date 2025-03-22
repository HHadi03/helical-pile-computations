import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logIn, signUp } from './actions'
export default function LandingPage() {
  return (
    <main className="min-h-screen relative bg-cover bg-center" 
      style={{backgroundImage: "url('/castle-background.jpg')", backgroundColor: 'rgba(0, 0, 0, 0.3)', backgroundBlendMode: 'darken'}}>
      
      {/* Logo/Title Section */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <img src="/logo.png" alt="Helical Pile Calculator" className="w-60 h-10" />
        <div className="text-gray-600 font-bold text-2xl">Helical Pile Computations</div>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <div className="bg-gray-900/90 p-6 rounded-lg shadow-xl w-80">
          <form>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-200 mb-2">Email</label>
              <Input id="email" name="email" type="email" required placeholder="Email" className="w-full bg-gray-800 border-gray-700 text-gray-200"/>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-200 mb-2">Password</label>
              <Input id="password" name="password" type="password" required placeholder="Password" className="w-full bg-gray-800 border-gray-700 text-gray-200"/>
            </div>
            
            <div className="space-y-4">
              <Button formAction={logIn} className="w-full bg-blue-600 hover:bg-blue-700"> Log in </Button>
              <Button formAction={signUp} className="w-full bg-green-600 hover:bg-green-700"> Sign up </Button>
              <Button className="text-center text-gray-400 hover:text-gray-200 text-sm">Forgotten Password? </Button>
            </div>

          </form>
        </div>
      </div>

    </main>
  )
}