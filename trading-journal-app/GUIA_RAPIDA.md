# 🚀 GUÍA RÁPIDA DE INICIO

## Para personas nuevas en programación

Esta guía te llevará de 0 a tener tu app en línea en **30 minutos**.

---

## 📦 PASO 1: Preparar tu Computadora

### Instalar Node.js

1. Ve a https://nodejs.org
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador
4. Verifica la instalación:
   - Abre la terminal (Command Prompt en Windows, Terminal en Mac)
   - Escribe: `node --version`
   - Debe mostrar algo como `v18.17.0`

---

## 🔥 PASO 2: Configurar Firebase (10 min)

### 2.1 Crear Proyecto

1. Abre https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Clic en **"Agregar proyecto"**
4. Nombre: `mi-trading-journal` (o el que prefieras)
5. Desactiva Google Analytics (no es necesario)
6. Clic en **"Crear proyecto"**
7. Espera 1 minuto... ☕

### 2.2 Activar Autenticación

1. En el menú de la izquierda → **Authentication**
2. Clic en **"Comenzar"**
3. Clic en **"Correo electrónico/Contraseña"**
   - Activa el switch
   - Guarda
4. Clic en **"Google"**
   - Activa el switch
   - Elige tu email de soporte
   - Guarda

### 2.3 Crear Base de Datos

1. En el menú de la izquierda → **Firestore Database**
2. Clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** ⚠️ (IMPORTANTE)
4. Elige ubicación: **us-central** (o la más cercana)
5. Clic en **"Habilitar"**

### 2.4 Activar Storage (para imágenes)

1. En el menú de la izquierda → **Storage**
2. Clic en **"Comenzar"**
3. Clic en **"Siguiente"**
4. Clic en **"Listo"**

### 2.5 Copiar Credenciales 🔑

1. Clic en el ícono de engranaje ⚙️ (arriba izquierda)
2. Clic en **"Configuración del proyecto"**
3. Baja hasta ver **"Tus apps"**
4. Clic en el ícono **`</>`** (Web)
5. Nombre de la app: `Trading Journal Web`
6. Clic en **"Registrar app"**
7. **COPIA** todo el objeto `firebaseConfig` que aparece
8. **PÉGALO** en un archivo temporal (Notepad, Notes, etc.)

Debe verse así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXX",
  authDomain: "mi-trading-journal.firebaseapp.com",
  projectId: "mi-trading-journal",
  storageBucket: "mi-trading-journal.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

---

## 💻 PASO 3: Configurar el Código (5 min)

### 3.1 Descargar el Proyecto

Si tienes el código en una carpeta, ábrelo en tu editor de código favorito (VS Code recomendado).

### 3.2 Pegar Credenciales de Firebase

1. Abre el archivo: `lib/firebase.ts`
2. Busca estas líneas:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",           // ← REEMPLAZA
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  // ...
};
```

3. **REEMPLAZA** con TUS credenciales que copiaste antes
4. **GUARDA** el archivo (Ctrl+S o Cmd+S)

### 3.3 Instalar Dependencias

1. Abre la **Terminal** en la carpeta del proyecto
   - VS Code: Menú → Terminal → Nueva Terminal
   - O abre Command Prompt/Terminal y navega a la carpeta

2. Escribe:
```bash
npm install
```

3. Espera 2-3 minutos mientras instala todo... ☕

---

## 🎮 PASO 4: Probar Localmente (2 min)

1. En la terminal, escribe:
```bash
npm run dev
```

2. Espera que aparezca:
```
Local:   http://localhost:3000
```

3. Abre tu navegador
4. Ve a: http://localhost:3000
5. ¡Deberías ver la página de login! 🎉

### Prueba rápida:
- Crea una cuenta con tu email
- Registra un trade de prueba
- Ve el dashboard

---

## 🌍 PASO 5: Publicar en Internet (10 min)

### Opción A: Con GitHub + Vercel (Recomendado)

#### 5.1 Crear Cuenta en GitHub

1. Ve a https://github.com
2. Clic en **"Sign up"**
3. Crea tu cuenta (es gratis)

#### 5.2 Subir Código a GitHub

En la terminal:

```bash
git init
git add .
git commit -m "Mi Trading Journal App"
git branch -M main
```

Luego:
1. Ve a https://github.com/new
2. Nombre: `trading-journal-app`
3. Deja todo en privado
4. Clic en **"Create repository"**
5. Copia los comandos que aparecen y pégalos en tu terminal

Ejemplo:
```bash
git remote add origin https://github.com/TU_USUARIO/trading-journal-app.git
git push -u origin main
```

#### 5.3 Deploy en Vercel

1. Ve a https://vercel.com
2. Clic en **"Sign Up"**
3. Inicia sesión con tu cuenta de GitHub
4. Clic en **"New Project"**
5. Busca `trading-journal-app`
6. Clic en **"Import"**
7. Clic en **"Deploy"**
8. Espera 2-3 minutos... ☕
9. ¡Verás tu app en línea! 🎉

Vercel te dará una URL tipo: `https://trading-journal-app-abc123.vercel.app`

---

## ✅ PASO 6: Configurar Dominio de Firebase

**IMPORTANTE:** Para que Google Sign-In funcione en tu dominio de Vercel:

1. Ve a Firebase Console
2. **Authentication** → **Settings** → **Authorized domains**
3. Clic en **"Add domain"**
4. Pega tu dominio de Vercel (ej: `trading-journal-app-abc123.vercel.app`)
5. Guarda

---

## 🎉 ¡LISTO!

Tu app está en línea y funcionando. Comparte el link con otros traders.

---

## 🔐 Seguridad: Cambiar Reglas de Firebase

**MUY IMPORTANTE:** Después de probar, cambia las reglas de Firestore.

1. Firebase Console → **Firestore Database** → **Reglas**
2. Reemplaza TODO con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /reflexiones/{reflexionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Clic en **"Publicar"**

Esto asegura que cada usuario solo vea SUS propios datos.

---

## 📱 Usa tu App

1. Abre tu URL de Vercel
2. Regístrate
3. Empieza a registrar tus trades
4. Analiza tu rendimiento

---

## 🆘 ¿Problemas?

### "Firebase not configured"
→ Revisa que copiaste bien las credenciales en `lib/firebase.ts`

### "Permission denied"
→ Asegúrate de haber activado Firestore en "modo de prueba"

### Google Sign-In no funciona
→ Agrega tu dominio de Vercel a los dominios autorizados en Firebase

### La app no carga
→ Revisa la consola del navegador (F12) para ver errores

---

## 🎯 Próximos Pasos

- [ ] Personaliza los colores en `tailwind.config.js`
- [ ] Agrega más gráficos
- [ ] Implementa plan premium
- [ ] Comparte con la comunidad

---

**¡Felicidades! Ya tienes tu propia app de trading profesional 🚀📈**
