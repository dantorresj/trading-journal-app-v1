# 🎨 ACTUALIZACIÓN - Configuraciones Personalizables

## ✨ Nuevas Características:

### 1. ⚙️ Página de Configuración
Los usuarios pueden personalizar:
- **Tipo de trading:** Futuros, Forex o CFDs
- **Setups personalizados:** Hasta 10 setups propios

### 2. 📊 Campos Dinámicos según Tipo de Trading

**Si selecciona "Futuros":**
- Campo: "Contratos" (números enteros: 1, 2, 3...)
- Campo: "Puntos" (números enteros: 58, 100...)

**Si selecciona "Forex":**
- Campo: "Lotes" (decimales: 0.01, 0.1, 1.0...)
- Campo: "Pips" (decimales: 25.5, 30.25...)

**Si selecciona "CFDs":**
- Campo: "Lotes" (decimales: 0.01, 0.1, 1.0...)
- Campo: "Ticks" (números enteros: 10, 25, 50...)

### 3. 🎯 Setups Personalizables
- Los usuarios definen sus propios setups
- Aparecen en el dropdown del formulario
- Hasta 10 setups diferentes

### 4. 📝 Resultado Específico Actualizado
- **Antes:** G, P, BE...
- **Ahora:** W (Win), L (Loss), BE...

---

## 📦 Archivos Creados/Actualizados:

### NUEVOS Archivos:
1. `app/settings/page.tsx` - Página de configuración
2. `types/index.ts` - Agregado tipo `UserSettings`

### ACTUALIZADOS:
1. `components/Navbar.tsx` - Agregado ícono ⚙️ para configuración
2. `app/new-trade/page.tsx` - Usa configuraciones personalizadas
3. `app/edit-trade/[id]/page.tsx` - Debe actualizarse (ver abajo)

---

## 🔄 Cómo Actualizar:

### Paso 1: Descargar archivos actualizados

Descarga el ZIP que te compartí con todos los archivos nuevos.

### Paso 2: Copiar archivos NUEVOS

Copia a tu proyecto:
```
app/settings/page.tsx (NUEVO)
```

### Paso 3: Reemplazar archivos ACTUALIZADOS

Reemplaza en tu proyecto:
```
types/index.ts
components/Navbar.tsx
app/new-trade/page.tsx
```

### Paso 4: Actualizar página de edición

El archivo `app/edit-trade/[id]/page.tsx` también necesita los cambios.

**Opción A - Reemplazar completo:** 
Usa el archivo que está en el ZIP

**Opción B - Hacer cambios manualmente:**

1. Agregar import:
```typescript
import { UserSettings } from '@/types';
```

2. Agregar estados (después de la línea 23):
```typescript
const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
const [loadingSettings, setLoadingSettings] = useState(true);
```

3. Cargar settings (nuevo useEffect):
```typescript
useEffect(() => {
  if (user && trade) {
    loadUserSettings();
  }
}, [user, trade]);

const loadUserSettings = async () => {
  if (!user) return;
  try {
    const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
    if (settingsDoc.exists()) {
      setUserSettings(settingsDoc.data() as UserSettings);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  } finally {
    setLoadingSettings(false);
  }
};
```

4. Definir labels dinámicos (antes del return):
```typescript
const tradingType = userSettings?.tradingType || 'Futuros';
const customSetups = userSettings?.customSetups || [];
const contractsLabel = tradingType === 'Futuros' ? 'Contratos' : 'Lotes';
const pointsLabel = tradingType === 'Futuros' ? 'Puntos' : (tradingType === 'Forex' ? 'Pips' : 'Ticks');
```

5. Cambiar los campos en el formulario:
- Setup dropdown: usar `customSetups.map()`
- Label "Contratos" → `{contractsLabel}`
- Label "Puntos" → `{pointsLabel}`
- Opciones de Resultado Específico: cambiar "G" por "W" y "P" por "L"

### Paso 5: Subir a GitHub

```powershell
git add .
git commit -m "Add customizable settings"
git push
```

---

## 🎯 Cómo Usar las Nuevas Funciones:

### Configurar tu trading:

1. **Login** en tu app
2. Clic en el **ícono ⚙️** en el navbar (arriba derecha)
3. Selecciona tu **tipo de trading**:
   - 🔮 Futuros
   - 💱 Forex
   - 📈 CFDs
4. Define tus **setups personalizados** (hasta 10)
5. Clic en **"💾 Guardar Configuración"**

### Registrar un trade:

1. **"+ Nuevo Trade"**
2. Los campos se adaptarán automáticamente:
   - Si elegiste Futuros: verás "Contratos" y "Puntos"
   - Si elegiste Forex: verás "Lotes" y "Pips"
   - Si elegiste CFDs: verás "Lotes" y "Ticks"
3. El dropdown de **Setup** mostrará tus setups personalizados
4. **Resultado Específico** ahora tiene W/L en lugar de G/P

---

## 🔍 Ejemplo Visual:

### Usuario que opera Futuros:
```
Configuración:
  ✓ Tipo: Futuros
  ✓ Setups: Balance, Imbalance, Trend Flow

Formulario muestra:
  • Contratos: [1]
  • Puntos: [58]
  • Setup: [Balance ▼]
  • Resultado Específico: [W ▼]
```

### Usuario que opera Forex:
```
Configuración:
  ✓ Tipo: Forex
  ✓ Setups: RSI Divergence, MA Cross, Breakout

Formulario muestra:
  • Lotes: [0.1]
  • Pips: [25.5]
  • Setup: [RSI Divergence ▼]
  • Resultado Específico: [W ▼]
```

---

## 🗄️ Estructura de Datos en Firebase:

### Nueva Colección: `userSettings`

Cada documento tiene:
```javascript
{
  userId: "abc123...",
  tradingType: "Futuros", // o "Forex" o "CFDs"
  customSetups: [
    "Balance",
    "Imbalance alcista",
    "Trend Flow",
    ...
  ],
  updatedAt: Timestamp
}
```

---

## ⚠️ Importante:

### Trades anteriores:
- **NO se modifican** automáticamente
- Los trades viejos mantienen sus campos originales
- Solo los nuevos trades usan la nueva configuración

### Compatibilidad:
- Si un usuario NO ha configurado sus settings:
  - Se usan valores por defecto (Futuros + setups originales)
  - El formulario funciona normalmente

### Validaciones:
- Contratos/Lotes: mínimo 1 (o 0.01 para Forex/CFDs)
- Setups vacíos se eliminan automáticamente
- Máximo 10 setups personalizados

---

## 🎨 Personalización Adicional:

### Agregar más tipos de trading:

En `app/settings/page.tsx`, línea ~80, agrega:
```typescript
<button onClick={() => setTradingType('Cripto')}>
  ₿ Cripto
</button>
```

Y actualiza los labels en los formularios.

### Agregar más campos personalizables:

1. Actualiza el tipo `UserSettings` en `types/index.ts`
2. Agrega el campo en `app/settings/page.tsx`
3. Usa el campo en los formularios

---

## 📊 Beneficios:

✅ **Flexibilidad:** Cada trader configura según su estilo
✅ **Profesional:** Se adapta a diferentes mercados
✅ **Escalable:** Fácil agregar más opciones después
✅ **UX Mejorada:** Menos opciones irrelevantes en el formulario

---

## 🆘 Solución de Problemas:

### "No aparece el ícono ⚙️"
→ Verifica que actualizaste `components/Navbar.tsx`

### "Los campos no cambian"
→ Ve a Configuración (⚙️) y guarda tus preferencias

### "No aparecen mis setups"
→ Recarga la página después de guardar en Configuración

### "Error al cargar configuración"
→ Verifica las reglas de Firestore para `userSettings`

---

## 🔒 Reglas de Firestore para userSettings:

Agrega esto en Firebase Console → Firestore → Rules:

```javascript
match /userSettings/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

---

## ✅ Checklist de Actualización:

- [ ] Copiar `app/settings/page.tsx`
- [ ] Actualizar `types/index.ts`
- [ ] Actualizar `components/Navbar.tsx`
- [ ] Actualizar `app/new-trade/page.tsx`
- [ ] Actualizar `app/edit-trade/[id]/page.tsx`
- [ ] Agregar reglas de Firestore
- [ ] Subir a GitHub (`git push`)
- [ ] Verificar en Vercel (esperar 2-3 min)
- [ ] Probar: Configuración → Guardar → Nuevo Trade

---

**¡Listo! Ahora tu app es totalmente personalizable** 🎨⚙️🚀
