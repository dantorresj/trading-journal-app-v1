'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, updateDoc, increment, orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Recording, RecordingComment } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RecordingDetailPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [recording, setRecording] = useState<Recording | null>(null);
  const [comments, setComments] = useState<RecordingComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    if (id) loadRecording();
  }, [user, id]);

  const loadRecording = async () => {
    try {
      const recSnap = await getDoc(doc(db, 'recordings', id));
      if (!recSnap.exists()) { setNotFound(true); setLoading(false); return; }

      const rec = { id: recSnap.id, ...recSnap.data() } as Recording;

      // Verificar acceso: privado solo para el dueño
      if (rec.visibility === 'private' && rec.userId !== user?.uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setRecording(rec);

      // Incrementar vistas si no es el dueño
      if (rec.userId !== user?.uid) {
        await updateDoc(doc(db, 'recordings', id), { views: increment(1) });
      }

      // Cargar comentarios
      if (rec.commentsEnabled) {
        const commQ = query(
          collection(db, 'recordingComments'),
          where('recordingId', '==', id)
        );
        const commSnap = await getDocs(commQ);
        const commList: RecordingComment[] = commSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as RecordingComment));
        commList.sort((a, b) => {
          const ta = (a.createdAt as any)?.seconds ?? new Date(a.createdAt).getTime() / 1000;
          const tb = (b.createdAt as any)?.seconds ?? new Date(b.createdAt).getTime() / 1000;
          return ta - tb;
        });
        setComments(commList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user || !recording) return;
    setSubmitting(true);
    try {
      const commentData: Omit<RecordingComment, 'id'> = {
        recordingId: id,
        userId: user.uid,
        userDisplayName: user.displayName || user.email || 'Trader',
        text: newComment.trim(),
        createdAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'recordingComments'), commentData);
      setComments(prev => [...prev, { id: docRef.id, ...commentData }]);
      setNewComment('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (val: any) => {
    const d = val?.seconds ? new Date(val.seconds * 1000) : new Date(val);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (val: any) => {
    const d = val?.seconds ? new Date(val.seconds * 1000) : new Date(val);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-900">Grabación no encontrada</p>
          <p className="text-sm text-gray-400">Puede ser privada o haber sido eliminada.</p>
          <button
            onClick={() => router.push('/recordings')}
            className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
          >
            Volver a grabaciones
          </button>
        </div>
      </div>
    );
  }

  if (!recording) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/recordings')}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 flex items-center space-x-1.5"
        >
          <span>←</span>
          <span>Grabaciones</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video player */}
            <div className="bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                src={recording.videoUrl}
                controls
                className="w-full h-full"
                playsInline
              />
            </div>

            {/* Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{recording.title}</h1>
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                    <span>{recording.userDisplayName}</span>
                    <span>·</span>
                    <span>{formatDuration(recording.duration)}</span>
                    <span>·</span>
                    <span>{formatDate(recording.createdAt)}</span>
                    <span>·</span>
                    <span>{recording.views} visitas</span>
                  </div>
                  {recording.description && (
                    <p className="text-sm text-gray-600 mt-4 leading-relaxed">{recording.description}</p>
                  )}
                </div>
                <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                  recording.visibility === 'public'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {recording.visibility === 'public' ? 'Público' : 'Privado'}
                </span>
              </div>

              {recording.userId === user?.uid && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                  <button
                    onClick={() => router.push('/recordings')}
                    className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                  >
                    Ver todas mis grabaciones
                  </button>
                </div>
              )}
            </div>

            {/* Comentarios */}
            {recording.commentsEnabled && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                <h2 className="font-semibold text-gray-900">
                  Comentarios
                  <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
                </h2>

                {/* Lista de comentarios */}
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-400">Sé el primero en comentar este análisis.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="flex space-x-3">
                        {/* Avatar minimal */}
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-gray-500">
                            {(c.userDisplayName || 'T')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm font-medium text-gray-900">{c.userDisplayName}</span>
                            <span className="text-xs text-gray-400">{formatTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                )}

                {/* Input de comentario */}
                {user && (
                  <div className="flex space-x-3 pt-2 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-gray-500">
                        {(user.displayName || user.email || 'T')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitComment();
                          }
                        }}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={submitComment}
                          disabled={!newComment.trim() || submitting}
                          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Enviando...' : 'Comentar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Si es privado y el dueño lo ve, mostrar nota */}
            {!recording.commentsEnabled && recording.userId === user?.uid && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <p className="text-sm text-gray-400">
                  Los comentarios están desactivados porque la grabación es privada. Puedes hacerla pública desde la lista de grabaciones.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">Detalles</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Autor</span>
                  <span className="text-gray-900 font-medium">{recording.userDisplayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duración</span>
                  <span className="text-gray-900 font-medium">{formatDuration(recording.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fecha</span>
                  <span className="text-gray-900 font-medium">{formatDate(recording.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visitas</span>
                  <span className="text-gray-900 font-medium">{recording.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibilidad</span>
                  <span className="text-gray-900 font-medium capitalize">{recording.visibility === 'public' ? 'Público' : 'Privado'}</span>
                </div>
                {recording.commentsEnabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comentarios</span>
                    <span className="text-gray-900 font-medium">{comments.length}</span>
                  </div>
                )}
              </div>
            </div>

            {recording.tradeId && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-3">Trade vinculado</h3>
                <button
                  onClick={() => router.push(`/all-trades`)}
                  className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
                >
                  Ver en mis trades
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
