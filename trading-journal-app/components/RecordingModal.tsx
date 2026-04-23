'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Recording } from '@/types';

interface RecordingModalProps {
  show: boolean;
  onClose: () => void;
  userId: string;
  userDisplayName: string;
  tradeId?: string;
  tradeActivo?: string;
}

type DrawTool = 'pen' | 'arrow' | 'rect' | 'eraser';
type RecordState = 'idle' | 'countdown' | 'recording' | 'preview' | 'uploading' | 'done';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'];
const STROKE_SIZES = [2, 4, 8, 14];

export default function RecordingModal({
  show,
  onClose,
  userId,
  userDisplayName,
  tradeId,
  tradeActivo
}: RecordingModalProps) {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [drawTool, setDrawTool] = useState<DrawTool>('pen');
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [strokeSize, setStrokeSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [title, setTitle] = useState(tradeActivo ? `Análisis ${tradeActivo}` : '');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoBlobRef = useRef<Blob | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Video oculto — recibe el stream de pantalla
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  // Canvas compuesto oculto — video + dibujos mezclados (esto es lo que se graba)
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  // Canvas de dibujo visible — overlay transparente donde el usuario dibuja
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  // Video de preview post-grabación
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const arrowStart = useRef<{ x: number; y: number } | null>(null);
  const rectStart = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  useEffect(() => {
    if (!show) {
      stopAll();
      setRecordState('idle');
      setElapsed(0);
      setCountdown(3);
      setErrorMsg('');
      chunksRef.current = [];
      videoBlobRef.current = null;
    }
  }, [show]);

  const stopAll = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    mediaRecorderRef.current?.stop();
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    micStreamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Loop continuo: copia cada frame del video oculto al canvas compuesto
  // y luego superpone el canvas de dibujo encima
  const startCompositeLoop = useCallback(() => {
    const composite = compositeCanvasRef.current;
    const draw = drawCanvasRef.current;
    const video = hiddenVideoRef.current;
    if (!composite || !draw || !video) return;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        composite.width = video.videoWidth;
        composite.height = video.videoHeight;
        // Sincronizar tamaño del canvas de dibujo con el video real
        if (draw.width !== video.videoWidth || draw.height !== video.videoHeight) {
          // Preservar contenido al redimensionar
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = draw.width;
          tempCanvas.height = draw.height;
          tempCanvas.getContext('2d')?.drawImage(draw, 0, 0);
          draw.width = video.videoWidth;
          draw.height = video.videoHeight;
          draw.getContext('2d')?.drawImage(tempCanvas, 0, 0, draw.width, draw.height);
        }
        ctx.drawImage(video, 0, 0);
        ctx.drawImage(draw, 0, 0);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, []);

  const startCapture = async () => {
    setErrorMsg('');
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      screenStreamRef.current = screenStream;
      micStreamRef.current = micStream;

      // Conectar stream al video oculto y forzar reproducción
      const hiddenVideo = hiddenVideoRef.current;
      if (hiddenVideo) {
        hiddenVideo.srcObject = screenStream;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        try {
          await hiddenVideo.play();
        } catch {
          // En algunos navegadores el play() requiere interacción previa
          hiddenVideo.oncanplay = () => hiddenVideo.play().catch(() => {});
        }
      }

      // Si el usuario cierra el selector de pantalla
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (mediaRecorderRef.current?.state === 'recording') stopRecording();
      });

      setRecordState('countdown');
      setCountdown(3);
      let c = 3;
      const cd = setInterval(() => {
        c--;
        setCountdown(c);
        if (c === 0) {
          clearInterval(cd);
          beginRecording(screenStream, micStream);
        }
      }, 1000);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setErrorMsg('Permiso denegado. Acepta compartir pantalla y micrófono para continuar.');
      } else {
        setErrorMsg('No se pudo iniciar la grabación. Intenta de nuevo.');
      }
      setRecordState('idle');
    }
  };

  const beginRecording = (screenStream: MediaStream, micStream: MediaStream) => {
    chunksRef.current = [];

    // Iniciar el loop de composición video+dibujos
    startCompositeLoop();

    const composite = compositeCanvasRef.current;
    if (!composite) return;

    // Capturar el stream del canvas compuesto a 30fps
    const canvasStream = composite.captureStream(30);

    // Combinar video del canvas compuesto + audio del micrófono
    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ]);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(combined, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const blob = new Blob(chunksRef.current, { type: mimeType });
      videoBlobRef.current = blob;
      if (previewVideoRef.current) {
        previewVideoRef.current.src = URL.createObjectURL(blob);
      }
      setRecordState('preview');
    };

    recorder.start(1000);
    setRecordState('recording');
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── Dibujo ───────────────────────────────────────────────────────────────────

  const getDrawCtx = () => drawCanvasRef.current?.getContext('2d') ?? null;

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (recordState !== 'recording') return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = getDrawCtx();
    if (!ctx) return;
    if (drawTool === 'pen' || drawTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      const canvas = drawCanvasRef.current!;
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      arrowStart.current = pos;
      rectStart.current = pos;
    }
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || recordState !== 'recording') return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = getDrawCtx();
    if (!ctx) return;

    if (drawTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeSize * 6;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (drawTool === 'arrow' && arrowStart.current) {
      ctx.putImageData(snapshotRef.current!, 0, 0);
      drawArrow(ctx, arrowStart.current, pos);
    } else if (drawTool === 'rect' && rectStart.current) {
      ctx.putImageData(snapshotRef.current!, 0, 0);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = strokeSize;
      ctx.strokeRect(
        rectStart.current.x, rectStart.current.y,
        pos.x - rectStart.current.x, pos.y - rectStart.current.y
      );
    }
  };

  const onPointerUp = () => {
    setIsDrawing(false);
    getDrawCtx()?.beginPath();
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const headLen = 18;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.strokeStyle = drawColor;
    ctx.fillStyle = drawColor;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    const ctx = getDrawCtx();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ── Upload ───────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!videoBlobRef.current || !title.trim()) return;
    setRecordState('uploading');
    setUploadProgress(0);
    try {
      const fileName = `recordings/${userId}/${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 8, 85));
      }, 300);
      await uploadBytes(storageRef, videoBlobRef.current);
      clearInterval(progressInterval);
      setUploadProgress(90);
      const videoUrl = await getDownloadURL(storageRef);
      setUploadProgress(95);
      const recordingData: Omit<Recording, 'id'> = {
        userId,
        userDisplayName,
        tradeId: tradeId || '',
        title: title.trim(),
        description: description.trim(),
        videoUrl,
        duration: elapsed,
        visibility,
        createdAt: new Date(),
        views: 0,
        commentsEnabled: visibility === 'public'
      };
      await addDoc(collection(db, 'recordings'), recordingData);
      setUploadProgress(100);
      setRecordState('done');
    } catch (e: any) {
      setErrorMsg('Error al subir el video. Intenta de nuevo.');
      setRecordState('preview');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      {/* Elementos ocultos necesarios para la grabación */}
      <video ref={hiddenVideoRef} style={{ display: 'none' }} muted playsInline />
      <canvas ref={compositeCanvasRef} style={{ display: 'none' }} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Grabar análisis</h2>
            {tradeActivo && <p className="text-sm text-gray-400 mt-0.5">{tradeActivo}</p>}
          </div>
          <button onClick={() => { stopAll(); onClose(); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors">×</button>
        </div>

        <div className="p-8">

          {/* IDLE */}
          {recordState === 'idle' && (
            <div className="space-y-8">
              <div className="border border-gray-100 rounded-xl p-6 space-y-2 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">Cómo funciona</p>
                <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-inside">
                  <li>Selecciona la pantalla o pestaña del broker a compartir</li>
                  <li>Tu micrófono grabará el análisis mientras explicas</li>
                  <li>Puedes dibujar sobre el área de grabación durante el análisis</li>
                  <li>Los dibujos quedan grabados en el video final</li>
                </ul>
              </div>
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>}
              <button onClick={startCapture} className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-4 rounded-xl transition-colors tracking-wide">
                Comenzar grabación
              </button>
            </div>
          )}

          {/* COUNTDOWN */}
          {recordState === 'countdown' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <p className="text-gray-500 text-sm uppercase tracking-widest">Grabación en</p>
              <div className="text-9xl font-bold text-gray-900 tabular-nums leading-none">{countdown}</div>
              <p className="text-gray-400 text-sm">Prepara tu pantalla</p>
            </div>
          )}

          {/* RECORDING */}
          {recordState === 'recording' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-mono font-medium text-gray-900">{formatTime(elapsed)}</span>
                </div>
                <button onClick={stopRecording} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                  Detener
                </button>
              </div>

              {/* Área de dibujo sobre fondo oscuro */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-600 text-sm select-none">Pantalla siendo grabada — dibuja aquí para anotar</p>
                </div>
                <canvas
                  ref={drawCanvasRef}
                  width={1280}
                  height={720}
                  className="absolute inset-0 w-full h-full"
                  style={{ cursor: drawTool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                />
              </div>

              {/* Herramientas */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest w-16">Herram.</span>
                  {(['pen', 'arrow', 'rect', 'eraser'] as DrawTool[]).map(tool => (
                    <button key={tool} onClick={() => setDrawTool(tool)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${drawTool === tool ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>
                      {tool === 'pen' ? 'Pluma' : tool === 'arrow' ? 'Flecha' : tool === 'rect' ? 'Rect.' : 'Borrar'}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={clearCanvas} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors">Limpiar</button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest w-16">Color</span>
                  <div className="flex space-x-1.5">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setDrawColor(c)} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full border-2 transition-transform ${drawColor === c ? 'border-gray-900 scale-125' : 'border-gray-200 hover:scale-110'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest w-16">Grosor</span>
                  <div className="flex items-center space-x-2">
                    {STROKE_SIZES.map(s => (
                      <button key={s} onClick={() => setStrokeSize(s)} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${strokeSize === s ? 'bg-gray-900' : 'bg-white border border-gray-200 hover:border-gray-400'}`}>
                        <span style={{ width: Math.min(s * 2.5, 20), height: Math.min(s * 2.5, 20), borderRadius: '50%', backgroundColor: strokeSize === s ? 'white' : '#111', display: 'block' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {recordState === 'preview' && (
            <div className="space-y-6">
              <video ref={previewVideoRef} controls className="w-full rounded-xl bg-black" style={{ aspectRatio: '16/9' }} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Análisis ES — doble techo en 1h" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción <span className="text-gray-400">(opcional)</span></label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Explica brevemente qué se ve en el video..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Visibilidad</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['private', 'public'] as const).map(v => (
                      <button key={v} onClick={() => setVisibility(v)} className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-colors ${visibility === v ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        <span className="block font-semibold mb-0.5">{v === 'private' ? 'Privado' : 'Público'}</span>
                        <span className={`text-xs ${visibility === v ? 'text-gray-300' : 'text-gray-400'}`}>{v === 'private' ? 'Solo tú puedes verlo' : 'La comunidad puede verlo y comentar'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>}
              <div className="flex space-x-3">
                <button onClick={() => { videoBlobRef.current = null; setRecordState('idle'); }} className="flex-1 border border-gray-200 text-gray-600 hover:border-gray-400 font-medium py-3 rounded-xl transition-colors text-sm">Grabar de nuevo</button>
                <button onClick={handleUpload} disabled={!title.trim()} className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">Guardar grabación</button>
              </div>
            </div>
          )}

          {/* UPLOADING */}
          {recordState === 'uploading' && (
            <div className="py-16 flex flex-col items-center space-y-6">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-sm text-gray-500">Subiendo video... {uploadProgress}%</p>
            </div>
          )}

          {/* DONE */}
          {recordState === 'done' && (
            <div className="py-16 flex flex-col items-center space-y-6 text-center">
              <div className="text-5xl">✓</div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Grabación guardada</p>
                <p className="text-sm text-gray-400 mt-1">{visibility === 'public' ? 'Tu análisis es público y la comunidad puede comentarlo.' : 'Tu análisis está guardado de forma privada.'}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:border-gray-400 transition-colors">Cerrar</button>
                <button onClick={() => window.location.href = '/recordings'} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-700 transition-colors">Ver mis grabaciones</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
