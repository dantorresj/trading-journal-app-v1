'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onLogout: () => void;
  userPlan?: 'free' | 'pro';
}

export default function Navbar({ onLogout, userPlan = 'free' }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md border-b border-silver sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-carbon">
              KintEdge
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/dashboard')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/new-trade"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/new-trade')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Nuevo Trade
            </Link>

            <Link
              href="/all-trades"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/all-trades')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Todos los Trades
            </Link>

            <Link
              href="/insights"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/insights')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Insights
            </Link>

            {/* NUEVO LINK */}
            <Link
              href="/recordings"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/recordings')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Recordings
            </Link>

            <Link
              href="/reflexion"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/reflexion')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Reflexión
            </Link>

            <Link
              href="/academia"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/academia')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Academia
            </Link>

            <Link
              href="/trading-plan"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/trading-plan')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Trading Plan
            </Link>

            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
                isActive('/profile')
                  ? 'bg-gold-kint text-white'
                  : 'text-carbon hover:text-gold-kint'
              }`}
            >
              Perfil
            </Link>

            {userPlan === 'free' && (
              <Link
                href="/upgrade"
                className="bg-gold-kint hover:bg-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 font-body shadow-gold"
              >
                ⚡ Upgrade
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            <Link
              href="/settings"
              className="flex items-center space-x-2 text-carbon hover:text-gold-kint px-3 py-2 rounded-lg transition-colors duration-300 font-body"
              title="Configuración"
            >
              <img src="/icons/icon-settings.png" alt="Settings" className="w-5 h-5" />
              <span className="hidden lg:inline">Configuración</span>
            </Link>

            <button
              onClick={onLogout}
              className="bg-lesson-red hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 font-body font-medium"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden py-2 space-y-1">
          <Link
            href="/dashboard"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/dashboard')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/new-trade"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/new-trade')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Nuevo Trade
          </Link>

          <Link
            href="/all-trades"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/all-trades')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Todos los Trades
          </Link>

          <Link
            href="/insights"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/insights')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Insights
          </Link>

          {/* NUEVO LINK MOBILE */}
          <Link
            href="/recordings"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/recordings')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Recordings
          </Link>

          <Link
            href="/reflexion"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/reflexion')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Reflexión
          </Link>

          <Link
            href="/academia"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/academia')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Academia
          </Link>

          <Link
            href="/trading-plan"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/trading-plan')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Trading Plan
          </Link>

          <Link
            href="/profile"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body ${
              isActive('/profile')
                ? 'bg-gold-kint text-white'
                : 'text-carbon hover:text-gold-kint'
            }`}
          >
            Perfil
          </Link>

          {userPlan === 'free' && (
            <Link
              href="/upgrade"
              className="block bg-gold-kint hover:bg-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 font-body shadow-gold"
            >
              ⚡ Upgrade
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}