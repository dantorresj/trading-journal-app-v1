import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAWyz159KDBY6gEiy-B4n0NvNwYtc_UrVw",
  authDomain: "trading-journal-d3f58.firebaseapp.com",
  projectId: "trading-journal-d3f58",
  storageBucket: "trading-journal-d3f58.firebasestorage.app",
  messagingSenderId: "482253180833",
  appId: "1:482253180833:web:c139f803ca12d4f6fd85e0"
};

// EMAIL DE TU CUENTA
const ADMIN_EMAIL = 'dan.torresjj@gmail.com'; // ← CAMBIA ESTO POR TU EMAIL

async function migrateUsers() {
  console.log('🚀 Iniciando migración de usuarios...');
  console.log('📧 Admin email:', ADMIN_EMAIL);
  console.log('');

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Conectado a Firebase');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`📊 Total de usuarios encontrados: ${snapshot.size}`);
    console.log('');
    
    if (snapshot.size === 0) {
      console.log('⚠️  No se encontraron usuarios en la colección');
      return;
    }
    
    let countUpdated = 0;
    let countSkipped = 0;
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      const userEmail = data.email || 'Sin email';
      const userId = userDoc.id;
      
      console.log(`\n👤 Procesando: ${userEmail}`);
      console.log(`   ID: ${userId}`);
      
      // Verificar si ya tiene los campos nuevos
      if (data.plan && data.role && typeof data.xp === 'number') {
        console.log(`   ⏭️  Ya migrado - Plan: ${data.plan}, Role: ${data.role}`);
        countSkipped++;
        continue;
      }
      
      // Determinar si es admin
      const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const newRole = isAdmin ? 'admin' : 'beta';
      
      console.log(`   🔄 Actualizando a: lifetime + ${newRole}`);
      
      // Actualizar usuario
      await updateDoc(doc(db, 'users', userId), {
        plan: 'lifetime',
        role: newRole,
        xp: 0,
        level: 1,
        badges: [],
        streak: 0,
        planStartDate: new Date()
      });
      
      countUpdated++;
      console.log(`   ✅ Actualizado correctamente`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`✅ Usuarios actualizados: ${countUpdated}`);
    console.log(`⏭️  Usuarios omitidos (ya migrados): ${countSkipped}`);
    console.log(`📊 Total procesados: ${snapshot.size}`);
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Ejecutar
console.log('');
console.log('='.repeat(60));
console.log('SCRIPT DE MIGRACIÓN DE USUARIOS');
console.log('='.repeat(60));
console.log('');

migrateUsers().then(() => {
  console.log('\n✅ Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});