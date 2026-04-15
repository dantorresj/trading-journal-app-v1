'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ShareLink,
  ShareLinkType,
  createShareLink,
  getUserShareLinks,
  toggleShareLink,
  deleteShareLink,
} from '@/lib/shareLinks';

interface ShareBitacoraModalProps {
  userId: string;
  displayName: string;
  onClose: () => void;
}

type CreateTab = 'todos' | 'estrategia' | 'cuenta';

export default function ShareBitacoraModal({
  userId,
  displayName,
  onClose,
}: ShareBitacoraModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Opciones disponibles cargadas desde Firestore
  const [uniqueStrategies, setUniqueStrategies] = useState<string[]>([]);
  const [uniqueCuentas, setUniquesCuentas] = useState<string[]>([]);

  // Selección del formulario de creación
  const [createTab, setCreateTab] = useState<CreateTab>('todos');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedCuenta, setSelectedCuenta] = useState('');

  // Cargar todos los trades para obtener estrategias y cuentas únicas
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'trades'), where('userId', '==', userId))
        );
        const estrategias = new Set<string>();
        const cuentas = new Set<string>();
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.setup) estrategias.add(data.setup);
          if (data.identificadorCuenta) cuentas.add(data.identificadorCuenta);
        });
        setUniqueStrategies([...estrategias].sort());
        setUniquesCuentas([...cuentas].sort());
        if ([...estrategias].length > 0) setSelectedStrategy([...estrategias][0]);
        if ([...cuentas].length > 0) setSelectedCuenta([...cuentas][0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTrades(false);
      }
    };
    fetchOptions();
    loadLinks();
  }, [userId]);

  const loadLinks = async () => {
    setLoadingLinks(true);
    try {
      const data = await getUserShareLinks(userId);
      data.sort((a, b) => {
        const order: Record<string, number> = { todos: 0, estrategia: 1, cuenta: 2 };
        const diff = (order[a.type] ?? 3) - (order[b.type] ?? 3);
        if (diff !== 0) return diff;
        const aLabel = a.strategy ?? a.cuenta ?? '';
        const bLabel = b.strategy ?? b.cuenta ?? '';
        return aLabel.localeCompare(bLabel);
      });
      setLinks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLinks(false);
    }
  };

  // Verifica si ya existe un link (activo o inactivo) para la misma combinación
  const existingLink = (type: CreateTab, value?: string) =>
    links.find((l) => {
      if (type === 'todos') return l.type === 'todos';
      if (type === 'estrategia') return l.type === 'estrategia' && l.strategy === value;
      if (type === 'cuenta') return l.type === 'cuenta' && l.cuenta === value;
      return false;
    });

  const handleCreate = async () => {
    if (creating) return;

    const value = createTab === 'estrategia' ? selectedStrategy
      : createTab === 'cuenta' ? selectedCuenta
      : undefined;

    // Si ya existe uno (activo o inactivo), no crear duplicado
    if (existingLink(createTab, value)) return;

    setCreating(true);
    try {
      await createShareLink(
        userId,
        displayName,
        createTab,
        createTab === 'estrategia' ? (value ?? null) : null,
        createTab === 'cuenta' ? (value ?? null) : null
      );
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

  const handleDelete = async (linkId: string) => {
    try {
      await deleteShareLink(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
      setConfirmDeleteId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (linkId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${linkId}`);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLinkLabel = (link: ShareLink) => {
    if (link.type === 'todos') return { icon: '📊', label: 'Todos los trades' };
    if (link.type === 'estrategia') return { icon: '🎯', label: link.strategy ?? '' };
    return { icon: '🏦', label: link.cuenta ?? '' };
  };

  // ¿Puede crearse el link seleccionado?
  const canCreate = () => {
    if (loadingTrades) return false;
    const value = createTab === 'estrategia' ? selectedStrategy
      : createTab === 'cuenta' ? selectedCuenta
      : undefined;
    if (createTab === 'estrategia' && !selectedStrategy) return false;
    if (createTab === 'cuenta' && !selectedCuenta) return false;
    return !existingLink(createTab, value);
  };

  const createButtonLabel = () => {
    const value = createTab === 'estrategia' ? selectedStrategy
      : createTab === 'cuenta' ? selectedCuenta
      : undefined;
    if (existingLink(createTab, value)) return 'Ya existe';
    return creating ? 'Creando...' : 'Crear link';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-silver">
          <div>
            <h2 className="text-xl font-heading font-bold text-carbon">Compartir Bitácora</h2>
            <p className="text-sm text-text-gray font-body mt-1">
              Los links se actualizan automáticamente con tus nuevos trades
            </p>
          </div>
          <button onClick={onClose} className="text-text-gray hover:text-carbon transition-colors text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Sección: Crear link ── */}
          <div>
            <h3 className="text-sm font-semibold text-carbon font-body uppercase tracking-wide mb-3">
              Crear nuevo link
            </h3>

            {/* Tabs tipo selector */}
            <div className="flex rounded-lg border border-silver overflow-hidden mb-4">
              {(['todos', 'estrategia', 'cuenta'] as CreateTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCreateTab(tab)}
                  className={`flex-1 py-2 text-sm font-body font-medium transition-colors ${
                    createTab === tab
                      ? 'bg-gold-kint text-white'
                      : 'bg-white text-text-gray hover:bg-gray-50'
                  }`}
                >
                  {tab === 'todos' ? '📊 Todos' : tab === 'estrategia' ? '🎯 Estrategia' : '🏦 Cuenta'}
                </button>
              ))}
            </div>

            {/* Dropdown condicional */}
            {createTab === 'estrategia' && (
              loadingTrades ? (
                <p className="text-sm text-text-gray font-body mb-3">Cargando estrategias...</p>
              ) : uniqueStrategies.length === 0 ? (
                <p className="text-sm text-text-gray font-body italic mb-3">No tienes estrategias registradas.</p>
              ) : (
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body mb-3"
                >
                  {uniqueStrategies.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )
            )}

            {createTab === 'cuenta' && (
              loadingTrades ? (
                <p className="text-sm text-text-gray font-body mb-3">Cargando cuentas...</p>
              ) : uniqueCuentas.length === 0 ? (
                <p className="text-sm text-text-gray font-body italic mb-3">No tienes cuentas registradas.</p>
              ) : (
                <select
                  value={selectedCuenta}
                  onChange={(e) => setSelectedCuenta(e.target.value)}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-gold-kint focus:border-transparent font-body mb-3"
                >
                  {uniqueCuentas.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )
            )}

            <button
              onClick={handleCreate}
              disabled={!canCreate() || creating}
              className="w-full py-2 rounded-lg text-sm font-body font-semibold transition-colors bg-gold-kint hover:bg-gold-dark text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createButtonLabel()}
            </button>
          </div>

          {/* ── Sección: Mis links ── */}
          <div>
            <h3 className="text-sm font-semibold text-carbon font-body uppercase tracking-wide mb-3">
              Mis links ({links.length})
            </h3>

            {loadingLinks ? (
              <p className="text-sm text-text-gray font-body">Cargando...</p>
            ) : links.length === 0 ? (
              <p className="text-sm text-text-gray font-body italic">Aún no has creado ningún link.</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => {
                  const { icon, label } = getLinkLabel(link);
                  const isConfirmingDelete = confirmDeleteId === link.id;

                  return (
                    <div
                      key={link.id}
                      className={`p-4 rounded-xl border transition-all ${
                        link.isActive ? 'border-gold-kint bg-amber-50' : 'border-silver bg-gray-50'
                      }`}
                    >
                      {/* Fila superior: label + toggle + eliminar */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold font-body ${link.isActive ? 'text-carbon' : 'text-text-gray'}`}>
                          {icon} {label}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(link)}
                            title={link.isActive ? 'Desactivar' : 'Activar'}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              link.isActive ? 'bg-gold-kint' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              link.isActive ? 'translate-x-4' : 'translate-x-1'
                            }`} />
                          </button>
                          {/* Eliminar */}
                          <button
                            onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : link.id)}
                            title="Eliminar link"
                            className="text-text-gray hover:text-lesson-red transition-colors text-lg leading-none"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Confirmación eliminar */}
                      {isConfirmingDelete && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 font-body flex-1">¿Eliminar permanentemente?</p>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="text-xs bg-lesson-red text-white px-2 py-1 rounded font-body hover:opacity-80"
                          >
                            Sí, eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs bg-gray-200 text-carbon px-2 py-1 rounded font-body hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* URL + copiar (solo si activo) */}
                      {link.isActive && (
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={`${window.location.origin}/share/${link.id}`}
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

                      {!link.isActive && !isConfirmingDelete && (
                        <p className="text-xs text-text-gray font-body">Link desactivado — actívalo con el toggle</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nota privacidad */}
          <p className="text-xs text-text-gray font-body border-t border-silver pt-4">
            🔒 Solo lectura. Se muestra tu nombre (<strong>{displayName}</strong>), nunca tu email.
          </p>
        </div>
      </div>
    </div>
  );
}
