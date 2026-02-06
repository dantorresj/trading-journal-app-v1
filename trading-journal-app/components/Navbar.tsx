'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-primary-500">
            📊 Trading Journal
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/new-trade"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              + Nuevo Trade
            </Link>
            
            <Link
              href="/all-trades"
              className="text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              Todos los Trades
            </Link>
            
            <Link
              href="/reflexion"
              className="text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              Reflexión
            </Link>
            
            <div className="border-l border-gray-300 h-8"></div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">Plan Free</p>
              </div>
              
              <Link
                href="/settings"
                className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-lg transition duration-200"
                title="Configuración"
              >
                ⚙️
              </Link>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg transition duration-200"
                title="Cerrar sesión"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
