import Link from 'next/link'
import { Button } from './components/ui/button'

export default function LandingPage() {
  return (
    <main>
        <div className="text-center p-20">
        <Link href="/overview">
          <Button>
            Go to Dashboard
          </Button>
          </Link>
           
        </div>
    </main>
  )
}
