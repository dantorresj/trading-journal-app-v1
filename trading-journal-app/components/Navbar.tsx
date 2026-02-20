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
        <div className="flex justify-between items-center h-24">
          {/* Logo - NO clickeable - MÁS GRANDE y SIN TEXTO */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="KintEdge Logo" 
              className="h-20 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/insights"
              className="flex items-center space-x-2 text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
              <img src="/icons/icon-insights.png" alt="Insights" className="w-16 h-16" />
              <span>Insights</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
              Dashboard
            </Link>

            <Link
              href="/new-trade"
              className="bg-gold-kint hover:bg-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-gold hover:shadow-gold-lg font-body"
            >
              + Nuevo Trade
            </Link>
            
            <Link
              href="/all-trades"
              className="text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
              Todos los Trades
            </Link>
            
            <Link
              href="/reflexion"
              className="flex items-center space-x-2 text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
              <img src="/icons/icon-reflection.png" alt="Reflexión" className="w-14 h-14" />
              <span>Reflexión</span>
            </Link>
            
            <Link
              href="/academia"
             className="flex items-center space-x-2 text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
             <img src="/icons/icon-academy.png" alt="Academia" className="w-5 h-5" />
              <span>Academia</span>
            </Link>

             <Link
              href="/trading-plan"
              className="flex items-center space-x-2 text-carbon hover:text-gold-kint px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
            >
             <img src="/icons/icon-plan.png" alt="Trading Plan" className="w-5 h-5" />
              <span>Trading Plan</span>
            </Link>

            <div className="border-l border-silver h-8"></div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-carbon font-body">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-text-gray font-body">Plan Free</p>
              </div>
              
              <Link
                href="/settings"
                className="text-text-gray hover:text-gold-kint px-3 py-2 rounded-lg transition-colors duration-300"
                title="Configuración"
              >
                <img src="/icons/icon-settings.png" alt="Settings" className="w-8 h-8" />
              </Link>
              <Link
                href="/profile"
                className="text-text-gray hover:text-gold-kint px-3 py-2 rounded-lg transition-colors duration-300"
                title="Mi Perfil"
              >
               👤
              </Link>
              <button
                onClick={onLogout}
                className="text-text-gray hover:text-lesson-red px-3 py-2 rounded-lg transition-colors duration-300"
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