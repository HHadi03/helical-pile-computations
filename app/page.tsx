import Image from 'next/image'
import { LoginForm } from './LoginForm'
import pageBackground from '@/public/pageBackground.png'
import logo from '@/public/logo.png'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="h-screen overflow-y-auto overflow-x-clip relative">
      {/* Background with overlay */}
      <Image
        src={pageBackground}
        alt="Background"
        placeholder="blur"
        fill
        className="-z-10 object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-br from-slate-900/60 via-slate-800/40 to-slate-900/70 -z-10" />

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating header (logo + title only) */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-12 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src={logo}
              alt="Company Logo"
              width={624}
              height={128}
              loading="eager"
              className="w-36 sm:w-2xs drop-shadow-lg transition-transform hover:scale-105 duration-300"
            />

            <div className="hidden sm:block w-px h-10 bg-white/20" />

            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white drop-shadow-lg">
              Helical Pile Computations
            </h1>
          </div>

          <Link
            href="https://targetfixings.co.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/80 hover:text-white transition-colors font-medium"
          >
            Visit Our Website →
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row items-center justify-between mt-15 px-6 sm:px-12 lg:px-20 pt-24 py-12 lg:py-20 gap-12 lg:gap-16 max-w-7xl mx-auto">
        {/* Hero content - left side */}
        <div className="flex-1 text-center lg:text-left space-y-6 animate-fadeIn">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-300 animate-cycle-text">
                Professional Engineering Software
              </span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
            Heli Pile Foundation
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 mt-2">
              Design & Analysis
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Versatile micropiling system for subsidence repairs, retaining walls,
            concrete-free foundations and infrastructure. Quick, cost-effective,
            and environmentally friendly.
          </p>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-xl mx-auto lg:mx-0">
            {[
              { icon: '📐', text: 'Structural Analysis' },
              { icon: '📊', text: 'Load Calculations' },
              { icon: '🔧', text: 'Design Optimisation' },
              { icon: '📋', text: 'Report Generation' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </span>
                <span className="text-white/90 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Login form - right side */}
        <div className="w-full max-w-md lg:max-w-lg animate-slideInRight">
          <div className="relative">
            {/* Decorative background elements */}
            <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-2xl" />
            <div className="absolute -inset-1 bg-linear-to-br from-blue-400/10 to-transparent rounded-xl" />

            {/* Form container */}
            <div className="relative bg-black/30 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl p-8 sm:p-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-t-xl" />

              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h3>
                <p className="text-white/60">
                  Sign in to access your workspace
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
