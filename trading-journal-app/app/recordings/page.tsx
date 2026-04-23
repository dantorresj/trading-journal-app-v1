'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection, query, where, getDocs, orderBy,
  doc, getDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Recording, UserProfile } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpgradeModal from '@/components/UpgradeModal';

type Tab = 'community' | 'mine';

export default function RecordingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('community');
  const [publicRecordings, setPublicRecordings] = useState<Recording[]>([]);
  const [myRecordings, setMyRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recording | null>(null);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Perfil del usuario para saber el plan
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      if (profileSnap.exists()) setUserProfile(profileSnap.data() as UserProfile);

      // Grabaciones públicas (community feed)
      const pubQ = query(
        collection(db, 'recordings'),
        where('visibility', '==', 'public')
      );
      const pubSnap = await getDocs(pubQ);
      const pubList: Recording[] = pubSnap.docs.map(d => ({ id: d.id, ...d.data() } as Recording));
      pubList.sort((a, b) => {
        const ta = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds : new Date(a.createdAt).getTime() / 1000;
        const tb = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds : new Date(b.createdAt).getTime() / 1000;
        return tb - ta;
      });
      setPublicRecordings(pubList);

      // Mis grabaciones
      const myQ = query(collection(db, 'recordings'), where('userId', '==', user.uid));
      const mySnap = await getDocs(myQ);
      const myList: Recording[] = mySnap.docs.map(d => ({ id: d.id, ...d.data() } as Recording));
      myList.sort((a, b) => {
        const ta = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds : new Date(a.createdAt).getTime() / 1000;
        const tb = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds : new Date(b.createdAt).getTime() / 1000;
        return tb - ta;
      });
      setMyRecordings(myList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'lifetime' || userProfile?.role === 'admin';

  const canRecord = () => {
    if (isPro) return true;
    // Free: máximo 1 grabación total
    return myRecordings.length < 1;
  };

  const handleNewRecording = () => {
    setShowExtensionModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    await deleteDoc(doc(db, 'recordings', deleteTarget.id));
    setMyRecordings(prev => prev.filter(r => r.id !== deleteTarget.id));
    setPublicRecordings(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleVisibility = async (recording: Recording) => {
    if (!recording.id) return;
    const newVis = recording.visibility === 'public' ? 'private' : 'public';
    await updateDoc(doc(db, 'recordings', recording.id), {
      visibility: newVis,
      commentsEnabled: newVis === 'public'
    });
    await loadAll();
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const formatDate = (val: any) => {
    const d = val?.seconds ? new Date(val.seconds * 1000) : new Date(val);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const displayList = tab === 'community' ? publicRecordings : myRecordings;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Cargando grabaciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Análisis en video</h1>
            <p className="text-gray-400 text-sm mt-1.5">
              Graba tu pantalla mientras explicas el análisis y la ejecución de tu trade.
            </p>
          </div>
          <button
            onClick={handleNewRecording}
            className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Nueva grabación
          </button>
        </div>

        {/* Free limit notice */}
        {!isPro && (
          <div className="mb-6 bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Plan gratuito</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {myRecordings.length >= 1
                  ? 'Has usado tu grabación gratuita. Actualiza a Pro para grabar sin límites.'
                  : 'Tienes 1 grabación disponible. Actualiza a Pro para grabar sin límites.'}
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors ml-4 whitespace-nowrap"
            >
              Ver planes
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-white border border-gray-100 rounded-xl p-1 mb-8 w-fit">
          {(
            [
              { id: 'community', label: 'Comunidad', count: publicRecordings.length },
              { id: 'mine', label: 'Mis grabaciones', count: myRecordings.length }
            ] as { id: Tab; label: string; count: number }[]
          ).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs ${tab === t.id ? 'text-gray-300' : 'text-gray-300'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {displayList.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <p className="text-gray-900 font-medium mb-2">
              {tab === 'community' ? 'Aún no hay grabaciones públicas' : 'No tienes grabaciones'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {tab === 'community'
                ? 'Sé el primero en compartir un análisis con la comunidad.'
                : 'Graba tu primera explicación de trade.'}
            </p>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
            >
              Grabar ahora
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayList.map(rec => (
              <RecordingCard
                key={rec.id}
                recording={rec}
                isOwner={rec.userId === user?.uid}
                onOpen={() => router.push(`/recordings/${rec.id}`)}
                onDelete={() => setDeleteTarget(rec)}
                onToggleVisibility={() => toggleVisibility(rec)}
                formatDuration={formatDuration}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal informativo de extensión */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nueva grabación</h3>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Para grabar un análisis usa la extensión <strong>KintEdge Recorder</strong> en Chrome. Puedes grabar directamente sobre TradingView, tu broker o cualquier video en el navegador, y dibujar encima mientras explicas.
              </p>
              <div className="bg-gray-900 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cómo grabar</p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>1. Abre TradingView, tu broker o tu video en otra pestaña</p>
                  <p>2. Presiona <kbd className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-mono">Ctrl+Shift+R</kbd> para iniciar</p>
                  <p>3. Usa <kbd className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-mono">Ctrl+Shift+D</kbd> para alternar entre dibujar y navegar</p>
                  <p>4. Al terminar el video aparece aquí automáticamente</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                ¿No tienes la extensión instalada? Contacta al soporte para obtenerla.
              </p>
            </div>
            <button
              onClick={() => setShowExtensionModal(false)}
              className="w-full mt-6 bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="recordings"
        currentCount={myRecordings.length}
        limit={1}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar grabación</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Seguro que deseas eliminar <strong>"{deleteTarget.title}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ── Card de grabación ─────────────────────────────────────────────────────────

interface CardProps {
  recording: Recording;
  isOwner: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  formatDuration: (s: number) => string;
  formatDate: (v: any) => string;
}

function RecordingCard({
  recording, isOwner, onOpen, onDelete, onToggleVisibility, formatDuration, formatDate
}: CardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Título */}
          <button
            onClick={onOpen}
            className="text-left group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors truncate">
              {recording.title}
            </h3>
          </button>

          {/* Meta */}
          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
            <span>{recording.userDisplayName}</span>
            <span>·</span>
            <span>{formatDuration(recording.duration)}</span>
            <span>·</span>
            <span>{formatDate(recording.createdAt)}</span>
            {recording.visibility === 'public' && (
              <>
                <span>·</span>
                <span>{recording.views} visitas</span>
              </>
            )}
          </div>

          {/* Descripción */}
          {recording.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{recording.description}</p>
          )}

          {/* Badges */}
          <div className="flex items-center space-x-2 mt-3">
            <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
              recording.visibility === 'public'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-50 text-gray-400'
            }`}>
              {recording.visibility === 'public' ? 'Público' : 'Privado'}
            </span>
            {recording.commentsEnabled && (
              <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-400">
                Comentarios activos
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onOpen}
            className="text-sm font-medium text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
          >
            Ver
          </button>
          {isOwner && (
            <>
              <button
                onClick={onToggleVisibility}
                className="text-xs text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors"
              >
                {recording.visibility === 'public' ? 'Hacer privado' : 'Publicar'}
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-red-400 hover:text-red-600 px-3 py-2 rounded-lg border border-gray-100 hover:border-red-100 transition-colors"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}