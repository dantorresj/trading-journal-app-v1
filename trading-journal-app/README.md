# 📊 Trading Journal App

Aplicación web profesional para traders. Registra tus operaciones, analiza tu rendimiento y mejora tu trading.

## ✨ Características

- 🔐 **Autenticación segura** (Email + Google)
- 📈 **Dashboard completo** con estadísticas en tiempo real
- 📊 **Gráficos avanzados** (curva de equity, P&L diario/mensual, distribución por activos)
- 📝 **Registro de trades** con imágenes
- 🧘 **Reflexiones diarias** para mejorar tu disciplina
- 📱 **Responsive** - funciona en móvil, tablet y escritorio
- ☁️ **Base de datos en la nube** (Firebase)
- 🚀 **Gratis para empezar**

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 + React + TypeScript
- **Estilos:** Tailwind CSS
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Auth
- **Storage:** Firebase Storage (para imágenes)
- **Gráficos:** Chart.js + React Chart.js 2
- **Hosting:** Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Google (para Firebase)
- Cuenta de GitHub (opcional, para deploy)
- Cuenta de Vercel (opcional, para hosting gratuito)

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombra tu proyecto (ej: "trading-journal-app")
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### 2. Configurar Firebase

#### A. Habilitar Autenticación

1. En el menú lateral, ve a **Authentication**
2. Clic en "Comenzar"
3. Habilita estos métodos de inicio de sesión:
   - ✅ Correo electrónico/contraseña
   - ✅ Google
4. Para Google: agrega tu dominio autorizado (ej: `localhost`, tu dominio de Vercel)

#### B. Crear Base de Datos Firestore

1. En el menú lateral, ve a **Firestore Database**
2. Clic en "Crear base de datos"
3. Elige **"Comenzar en modo de prueba"** (¡IMPORTANTE!)
4. Selecciona una ubicación cercana a tus usuarios
5. Clic en "Habilitar"

**Reglas de seguridad para Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir solo sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    match /reflexiones/{reflexionId} {
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### C. Configurar Storage (para imágenes)

1. En el menú lateral, ve a **Storage**
2. Clic en "Comenzar"
3. Acepta las reglas de seguridad predeterminadas
4. Elige la misma ubicación que Firestore

**Reglas de seguridad para Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trades/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Obtener Credenciales de Firebase

1. En Firebase Console, ve a **Configuración del proyecto** (ícono de engranaje)
2. En la pestaña "General", busca "Tus apps"
3. Clic en el ícono `</> Web`
4. Registra tu app (ej: "Trading Journal Web")
5. **COPIA** las credenciales que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Configurar el Proyecto Localmente

1. **Abre el archivo** `lib/firebase.ts`
2. **Reemplaza** los valores placeholder con TUS credenciales de Firebase:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",           // ← Pega aquí
  authDomain: "tu-proyecto.firebaseapp.com",  // ← Pega aquí
  projectId: "tu-proyecto-id",         // ← Pega aquí
  storageBucket: "tu-proyecto.appspot.com",   // ← Pega aquí
  messagingSenderId: "123456789",      // ← Pega aquí
  appId: "1:123456789:web:abc123"      // ← Pega aquí
};
```

3. **Guarda el archivo**

### 5. Instalar Dependencias

En la terminal, dentro de la carpeta del proyecto:

```bash
npm install
```

### 6. Ejecutar en Local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Desplegar a Producción (Vercel)

### Opción 1: Deploy desde GitHub (Recomendado)

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/trading-journal-app.git
git push -u origin main
```

2. Ve a [Vercel](https://vercel.com)
3. Clic en "New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente Next.js
6. Clic en "Deploy"
7. ¡Listo! Tu app está en línea 🎉

### Opción 2: Deploy directo desde CLI

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones en pantalla.

## 📱 Uso de la Aplicación

### Para Usuarios (Traders)

1. **Registrarse/Iniciar sesión**
   - Email + contraseña
   - O con cuenta de Google

2. **Registrar un trade**
   - Clic en "+ Nuevo Trade"
   - Llena el formulario
   - Sube imagen (opcional)
   - Guarda

3. **Ver Dashboard**
   - Estadísticas en tiempo real
   - Gráficos interactivos
   - Análisis de rendimiento

4. **Reflexiones diarias**
   - Sección "Reflexión"
   - Analiza tu día de trading
   - Mejora tu disciplina

## 🎯 Roadmap Futuro

### Fase 2 - Monetización
- [ ] Plan Premium con límites aumentados
- [ ] Exportar datos a PDF/Excel
- [ ] Análisis avanzado con AI
- [ ] Integración con Stripe/PayPal

### Fase 3 - Características Avanzadas
- [ ] Comparar rendimiento con otros traders (anónimo)
- [ ] App móvil nativa (iOS/Android)
- [ ] Integración con brokers (MT4/MT5)
- [ ] Comunidad de traders

## 🔧 Estructura del Proyecto

```
trading-journal-app/
├── app/
│   ├── dashboard/          # Dashboard principal
│   ├── new-trade/          # Formulario de nuevo trade
│   ├── reflexion/          # Formulario de reflexión
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Página de login/registro
│   └── globals.css         # Estilos globales
├── components/
│   ├── DashboardCharts.tsx # Gráficos del dashboard
│   ├── DashboardStats.tsx  # Estadísticas del dashboard
│   └── Navbar.tsx          # Barra de navegación
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticación
├── lib/
│   └── firebase.ts         # Configuración de Firebase
├── types/
│   └── index.ts            # Tipos TypeScript
└── package.json            # Dependencias
```

## 🐛 Solución de Problemas

### Error: "Firebase not configured"
- Verifica que hayas copiado correctamente las credenciales en `lib/firebase.ts`

### Error: "Permission denied" en Firestore
- Revisa las reglas de seguridad en Firebase Console
- Asegúrate de estar autenticado

### Las imágenes no se suben
- Verifica las reglas de Storage en Firebase Console
- Revisa que el tamaño de la imagen sea < 5MB

### No aparecen los gráficos
- Verifica que Chart.js esté instalado: `npm install chart.js react-chartjs-2`
- Revisa la consola del navegador para errores

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación de [Firebase](https://firebase.google.com/docs)
2. Revisa la documentación de [Next.js](https://nextjs.org/docs)
3. Busca en [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 👨‍💻 Desarrollado con ❤️ por Claude

---

**¡Éxito con tu trading! 📈🚀**
