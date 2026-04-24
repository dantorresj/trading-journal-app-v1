'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  plan: string;
  status: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('todos');

  useEffect(() => {
    const checkAndLoad = async () => {
      if (!user) { router.push('/'); return; }

      // Verificar que sea admin
      const { getDoc, doc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.data()?.role !== 'admin') { router.push('/'); return; }

      // Cargar usuarios
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    };

    checkAndLoad();
  }, [user]);

  const cambiarPlan = async (uid: string, plan: string) => {
    await updateDoc(doc(db, 'users', uid), { plan });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, plan } : u));
  };

  const cambiarStatus = async (uid: string, status: string) => {
    await updateDoc(doc(db, 'users', uid), { status });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u));
  };

  const usuariosFiltrados = users.filter(u => {
    const coincideBusqueda =
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase());
    const coincidePlan = filterPlan === 'todos' || u.plan === filterPlan;
    return coincideBusqueda && coincidePlan;
  });

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>
      Cargando usuarios...
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '0.5rem' }}>
        Panel de administración
      </h1>
      <p style={{ fontSize: '14px', color: '#888', marginBottom: '2rem' }}>
        {users.length} usuarios registrados
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '14px' }}
        />
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '14px' }}
        >
          <option value="todos">Todos los planes</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #e5e5e5', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: '500', color: '#888' }}>Usuario</th>
              <th style={{ padding: '10px 12px', fontWeight: '500', color: '#888' }}>Registrado</th>
              <th style={{ padding: '10px 12px', fontWeight: '500', color: '#888' }}>Plan</th>
              <th style={{ padding: '10px 12px', fontWeight: '500', color: '#888' }}>Status</th>
              <th style={{ padding: '10px 12px', fontWeight: '500', color: '#888' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u.uid} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '500' }}>{u.displayName || '—'}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{u.email}</div>
                </td>
                <td style={{ padding: '12px', color: '#888' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-MX') : '—'}
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={u.plan}
                    onChange={e => cambiarPlan(u.uid, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '0.5px solid #ccc', fontSize: '13px' }}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: u.status === 'active' ? '#E1F5EE' : '#FCEBEB',
                    color: u.status === 'active' ? '#085041' : '#791F1F'
                  }}>
                    {u.status === 'active' ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => cambiarStatus(u.uid, u.status === 'active' ? 'suspended' : 'active')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '0.5px solid #ccc',
                      background: 'transparent',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {u.status === 'active' ? 'Suspender' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuariosFiltrados.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
            No se encontraron usuarios
          </p>
        )}
      </div>
    </div>
  );
}