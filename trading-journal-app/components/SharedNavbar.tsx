'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SharedNavbarProps {
  linkId: string;
  displayName: string;
}

export default function SharedNavbar({ linkId, displayName }: SharedNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: `/share/${linkId}` },
    { label: 'Trades', href: `/share/${linkId}/trades` },
    { label: 'Perfil', href: `/share/${linkId}/profile` },
  ];

  return (
    <nav className="bg-white border-b border-silver shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo / nombre */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-heading font-bold text-carbon">
              📒 Bitácora de
            </span>
            <span className="text-lg font-heading font-bold text-gold-kint">
              {displayName}
            </span>
          </div>

          {/* Navegación */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-kint text-white'
                      : 'text-text-gray hover:text-carbon hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Badge solo lectura */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-gray font-body bg-gray-100 px-3 py-1 rounded-full">
            <span>🔒</span>
            <span>Solo lectura</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
