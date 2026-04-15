'use client';

import { useEffect, useState } from 'react';
import { Trade } from '@/types';
import {
  ShareLink,
  createShareLink,
  getUserShareLinks,
  toggleShareLink,
} from '@/lib/shareLinks';

interface ShareBitacoraModalProps {
  userId: string;
  displayName: string;
  trades: Trade[];
  onClose: () => void;
}

export default function ShareBitacoraModal({
  userId,
  displayName,
  trades,
  onClose,
}: ShareBitacoraModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estrategias únicas de los trades del usuario
  const uniqueStrategies = Array.from(new Set(trades.map((t) => t.setup).filter(Boolean)));

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await getUserShareLinks(userId);
      // Ordenar: "todos" primero, luego por estrategia
      data.sort((a, b) => {
        if (a.strategy === null) return -1;
        if (b.strategy === null) return 1;
        return (a.strategy ?? '').localeCompare(b.strategy ?? '');
      });
      setLinks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (strategy: string | null) => {
    // No crear duplicado activo para la misma estrategia
    const exists = links.find(
      (l) => l.strategy === strategy && l.isActive
    );
    if (exists) return;

    setCreating(true);
    try {
      await createShareLink(userId, displayName, strategy);
      await loadLinks();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (link: ShareLink) => {
    try {
      await toggleShareLink(link.id, !link.isActive);
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/share/${linkId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLinkUrl = (linkId: string) =>
    `${window.location.origin}/share/${linkId}`;

  // Qué estrategias ya tienen link activo
  const hasActiveLink = (strategy: string | null) =>
    links.some((l) => l.strategy === strategy && l.isActive);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-silver">
          <div>
            <h2 className="text-xl font-heading font-bold text-carbon">
              Compartir Bitácora
            </h2>
            <p className="text-sm text-text-gray font-body mt-1">
              Genera links de solo lectura para compartir tus trades
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-gray hover:text-carbon transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Crear nuevos links */}
          <div>
            <h3 className="text-sm font-semibold text-carbon font-body uppercase tracking-wide mb-3">
              Crear link
            </h3>
            <div className="space-y-2">
              {/* Link para todos */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-silver">
                <span className="text-sm font-body text-carbon">
                  📊 Todos los trades
                </span>
                {hasActiveLink(null) ? (
                  <span className="text-xs text-text-gray font-body">Ya existe</span>
                ) : (
                  <button
                    onClick={() => handleCreate(null)}
                    disabled={creating}
                    className="text-sm bg-gold-kint hover:bg-gold-dark text-white px-3 py-1 rounded-lg font-body transition-colors disabled:opacity-50"
                  >
                    Crear
                  </button>
                )}
              </div>

              {/* Links por estrategia */}
              {uniqueStrategies.map((strategy) => (
                <div
                  key={strategy}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-silver"
                >
                  <span className="text-sm font-body text-carbon">
                    🎯 {strategy}
                  </span>
                  {hasActiveLink(strategy) ? (
                    <span className="text-xs text-text-gray font-body">Ya existe</span>
                  ) : (
                    <button
                      onClick={() => handleCreate(strategy)}
                      disabled={creating}
                      className="text-sm bg-gold-kint hover:bg-gold-dark text-white px-3 py-1 rounded-lg font-body transition-colors disabled:opacity-50"
                    >
                      Crear
                    </button>
                  )}
                </div>
              ))}

              {uniqueStrategies.length === 0 && (
                <p className="text-xs text-text-gray font-body italic">
                  No tienes estrategias registradas aún.
                </p>
              )}
            </div>
          </div>

          {/* Links existentes */}
          <div>
            <h3 className="text-sm font-semibold text-carbon font-body uppercase tracking-wide mb-3">
              Mis links
            </h3>

            {loading ? (
              <p className="text-sm text-text-gray font-body">Cargando...</p>
            ) : links.length === 0 ? (
              <p className="text-sm text-text-gray font-body italic">
                Aún no has creado ningún link.
              </p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className={`p-4 rounded-xl border ${
                      link.isActive
                        ? 'border-gold-kint bg-amber-50'
                        : 'border-silver bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold font-body text-carbon">
                        {link.strategy === null ? '📊 Todos los trades' : `🎯 ${link.strategy}`}
                      </span>
                      {/* Toggle activo/inactivo */}
                      <button
                        onClick={() => handleToggle(link)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          link.isActive ? 'bg-gold-kint' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            link.isActive ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {link.isActive && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          readOnly
                          value={getLinkUrl(link.id)}
                          className="flex-1 text-xs font-body bg-white border border-silver rounded px-2 py-1 text-text-gray truncate"
                        />
                        <button
                          onClick={() => copyLink(link.id)}
                          className="text-xs bg-carbon hover:bg-gray-700 text-white px-3 py-1 rounded font-body transition-colors whitespace-nowrap"
                        >
                          {copiedId === link.id ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    )}

                    {!link.isActive && (
                      <p className="text-xs text-text-gray font-body mt-1">
                        Link desactivado — actívalo con el toggle
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota de privacidad */}
          <p className="text-xs text-text-gray font-body border-t border-silver pt-4">
            🔒 Los links son de solo lectura. Se muestra tu nombre (<strong>{displayName}</strong>), nunca tu email.
            Puedes desactivar cualquier link en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
}
