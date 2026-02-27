'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-silver py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-text-gray font-body">
          <div className="mb-4 md:mb-0">
            <p>© 2026 <span className="font-heading">KintEdge</span>. Todos los derechos reservados.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/terms" 
              className="hover:text-gold-kint transition-colors duration-200"
            >
              Términos y Condiciones
            </Link>
            <span className="text-silver">·</span>
            <Link 
              href="/privacy" 
              className="hover:text-gold-kint transition-colors duration-200"
            >
              Privacidad
            </Link>
            <span className="text-silver">·</span>
            <Link 
              href="/support" 
              className="hover:text-gold-kint transition-colors duration-200"
            >
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
