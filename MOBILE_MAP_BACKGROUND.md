# 🗺️ Mapa como Background en Vista Mobile

## 📱 Vista General

Se ha implementado un diseño inmersivo para la vista mobile donde el **mapa ocupa toda la pantalla** como un background de fondo, creando un efecto de capas similar a aplicaciones modernas como Uber, Airbnb y Google Maps.

---

## 🎯 Objetivo del Diseño

### Antes:
- Mapa con altura fija (300px)
- Ocupa una sección específica
- Elementos en flujo normal del documento

### Después (Mobile):
- Mapa a **pantalla completa** (100vw x 100vh)
- Posicionado como **background fijo**
- Elementos flotan sobre el mapa con glassmorphism
- Mayor inmersión y aprovechamiento del espacio

---

## 🏗️ Arquitectura de Capas (Mobile)

```
┌─────────────────────────────────────┐
│  CAPA 3: z-index: 1000              │
│  ┌─────────────────────────────┐    │
│  │  Navbar Mobile              │    │
│  │  Bottom Navigation          │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  CAPA 2: z-index: 5-10              │
│  ┌─────────────────────────────┐    │
│  │  Main Content               │    │
│  │  • Filtros POI              │    │
│  │  • POI Cards                │    │
│  │  • Secciones                │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  CAPA 1: z-index: 0                 │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     MAPA DE FONDO           │    │
│  │     (100vw x 100vh)         │    │
│  │                             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 💻 Cambios Implementados

### 1. **Mapa como Background Fixed (Mobile)**

#### CSS Base (< 768px):
```css
.map-section {
    /* MOBILE: Mapa como background de pantalla completa */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0;
    overflow: visible;
    box-shadow: none;
    z-index: 0; /* Totalmente por detrás de todo */
}

.map-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
    overflow: hidden;
}
```

**Características:**
- `position: fixed` - Se mantiene fijo al hacer scroll
- `width: 100vw; height: 100vh` - Pantalla completa
- `z-index: 0` - Capa más baja
- Sin bordes redondeados ni sombras en mobile

---

### 2. **Main Content Flotante**

```css
.main-content {
    margin-top: 120px;
    padding-bottom: 60px;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    position: relative;
    z-index: 5; /* Por encima del mapa */
}
```

**Efecto:** El contenido principal flota sobre el mapa

---

### 3. **Filtros POI con Glassmorphism Mejorado**

```css
.quick-filters-mobile {
    margin-top: 60px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1.5rem 1rem;
    position: relative;
    z-index: 10; /* Por encima del mapa */
}

.filter-chip {
    /* Glassmorphism mejorado para legibilidad sobre el mapa */
    background: rgba(255, 255, 255, 0.85); /* Más opaco: 0.7 → 0.85 */
    backdrop-filter: blur(12px) saturate(180%); /* Más blur: 10px → 12px */
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    
    box-shadow: 
        0 8px 32px 0 rgba(29, 53, 87, 0.15), /* Sombra más prominente */
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}
```

**Mejoras:**
- Mayor opacidad (85% vs 70%) para mejor legibilidad
- Blur aumentado (12px vs 10px) para efecto más marcado
- Sombras más prominentes para destacar sobre el mapa

---

### 4. **POI Cards Flotantes**

```css
.poi-card-mobile {
    background-color: var(--white);
    margin-bottom: 1rem;
    padding: 1.2rem;
    border-radius: 20px;
    box-shadow: 0 4px 12px var(--shadow);
    position: relative;
    z-index: 5; /* Por encima del mapa */
}
```

---

### 5. **Navegación con Máxima Prioridad**

Ya configurado previamente:
```css
.navbar-mobile {
    z-index: 1000; /* Máxima prioridad */
}

.bottom-nav {
    z-index: 1000; /* Máxima prioridad */
}
```

---

## 📐 Responsive: Restauración en Tablet y Desktop

### Tablet (768px - 1023px):
```css
@media (min-width: 768px) and (max-width: 1023px) {
    .map-section {
        position: relative; /* Restaura posición normal */
        margin: 2rem 2.5rem;
        height: 550px;
        border-radius: 25px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 1;
        overflow: hidden;
    }
    
    .map-container {
        border-radius: 25px;
    }
}
```

### Desktop Medium (1024px - 1365px):
```css
@media (min-width: 1024px) and (max-width: 1365px) {
    .map-section {
        position: relative;
        margin: 0 1.5rem 1.5rem 1.5rem;
        height: 400px;
        border-radius: 20px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 1;
        overflow: hidden;
    }
    
    .map-container {
        border-radius: 20px;
    }
}
```

### Desktop Large (1366px+):
```css
@media (min-width: 1366px) {
    .map-section {
        position: relative;
        margin: 0 2rem 1.5rem 2rem;
        border-radius: 20px;
        height: 500px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 1;
    }

    .map-container {
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
    }
}
```

**En tablet y desktop:**
- Mapa vuelve a `position: relative`
- Recupera márgenes y bordes redondeados
- Altura definida según breakpoint
- Sombras visibles
- **SIN extensión** debajo del bottom nav (comportamiento normal)
- Overflow: hidden (sin desbordamiento)

---

## 🎨 Jerarquía de Z-Index

| Elemento | Z-Index | Descripción |
|----------|---------|-------------|
| Navbar Mobile | 1000 | Máxima prioridad (siempre visible) |
| Bottom Navigation | 1000 | Máxima prioridad (siempre visible) |
| Filtros POI Mobile | 10 | Flotan sobre el mapa |
| Main Content | 5 | Contenido general sobre el mapa |
| POI Cards | 5 | Tarjetas sobre el mapa |
| Mapa (Mobile) | 0 | Background de fondo |
| Mapa (Tablet/Desktop) | 1 | Posición normal con profundidad |

---

## ✨ Beneficios del Diseño

### 🎯 UX (Experiencia de Usuario)
1. **Inmersión Total**: El usuario está constantemente sumergido en el mapa
2. **Contexto Geográfico**: Siempre visible la ubicación de los POIs
3. **Sensación de Aplicación Nativa**: Similar a apps líderes del mercado
4. **Navegación Intuitiva**: Los elementos flotan de manera natural

### 🎨 UI (Interfaz Visual)
1. **Glassmorphism Efectivo**: Los filtros translúcidos destacan sobre el mapa real
2. **Uso Eficiente del Espacio**: No hay píxeles desperdiciados en mobile
3. **Profundidad Visual**: Capas bien definidas crean sensación 3D
4. **Diseño Moderno**: Alineado con tendencias actuales de UI

### 📱 Performance
1. **Fixed Position**: El mapa no se re-renderiza al hacer scroll
2. **Backdrop-filter**: Efecto visual sin carga adicional de imágenes
3. **Z-index Optimizado**: Capas organizadas para mejor rendering
4. **Responsive Inteligente**: Cada breakpoint optimizado para su dispositivo

---

## 🧪 Testing Recomendado

### Mobile (< 768px):
- ✅ Mapa visible de fondo al cargar
- ✅ Filtros POI legibles sobre el mapa
- ✅ Scroll suave con mapa fijo
- ✅ POI cards bien contrastadas
- ✅ Bottom nav siempre accesible

### Tablet (768px - 1023px):
- ✅ Mapa vuelve a posición normal
- ✅ Altura de 550px apropiada
- ✅ Bordes redondeados visibles
- ✅ Comportamiento estándar (sin extensión)

### Desktop (1024px+):
- ✅ Mapa en layout normal
- ✅ Altura según breakpoint (400px o 500px)
- ✅ Bordes redondeados
- ✅ Bottom nav oculto (navbar desktop visible)
- ✅ Hover preview funcionando
- ✅ Overflow: hidden (contenido contenido)

---

## 🚀 Próximos Pasos Posibles

### Opciones de Mejora:
1. **Overlay con gradiente** en mobile para mejorar contraste:
   ```css
   .map-section::after {
       content: '';
       position: absolute;
       top: 0; left: 0; right: 0; bottom: 0;
       background: linear-gradient(
           to bottom,
           rgba(255,255,255,0.3) 0%,
           transparent 20%,
           transparent 80%,
           rgba(255,255,255,0.3) 100%
       );
       pointer-events: none;
   }
   ```

2. **Parallax sutil** en elementos flotantes al hacer scroll

3. **Animaciones de entrada** para los filtros y cards:
   ```css
   @keyframes floatIn {
       from {
           opacity: 0;
           transform: translateY(20px);
       }
       to {
           opacity: 1;
           transform: translateY(0);
       }
   }
   ```

4. **Modo de enfoque** que atenúa el mapa cuando se abre un POI card

---

## 📝 Resumen de Archivos Modificados

### `/css/styles.css`
- **Línea ~602**: `.map-section` - Mapa fixed en mobile SOLAMENTE
- **Línea ~408**: `.quick-filters-mobile` - z-index aumentado
- **Línea ~428**: `.filter-chip` - Glassmorphism mejorado
- **Línea ~393**: `.main-content` - z-index añadido
- **Línea ~657**: `.poi-card-mobile` - z-index añadido
- **Línea ~1555**: Media query tablet - Mapa restaurado a estado normal
- **Línea ~1803**: Media query desktop medium - Mapa restaurado a estado normal
- **Línea ~2048**: Media query desktop large - Mapa restaurado a estado normal

### Sin cambios en HTML
No se requirieron modificaciones en `index.html`

---

## 🎊 Estado Final

✅ **Mobile (< 768px)**: Mapa como background de pantalla completa con elementos flotantes  
✅ **Tablet (≥ 768px)**: Mapa en posición normal con altura 550px, comportamiento estándar  
✅ **Desktop Medium (1024-1365px)**: Mapa normal con altura 400px, comportamiento estándar  
✅ **Desktop Large (≥ 1366px)**: Mapa normal con altura 500px, comportamiento estándar  
✅ **Glassmorphism**: Mejorado para mejor legibilidad en mobile  
✅ **Z-index**: Jerarquía optimizada en mobile, normal en tablet/desktop  
✅ **Sin errores**: Validación CSS/HTML exitosa  

---

**Fecha de implementación:** 27 de noviembre de 2025  
**Dispositivos objetivo:** Mobile exclusivamente (< 768px)  
**Compatibilidad:** Responsive completo - Desktop mantiene comportamiento original
