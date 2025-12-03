# 🗺️ Visualización de Rutas en el Mapa

## 📍 Funcionalidad Principal

Cuando el usuario hace click en el botón **Routes** y tiene favoritos guardados, después de cerrar el modal informativo, el mapa muestra automáticamente **todas las rutas caminando** desde su ubicación actual hacia cada lugar favorito.

---

## 🎨 Características Visuales

### 1. **Marcador de Usuario**
- **Posición**: Ubicación actual (GPS)
- **Icono**: Marcador azul estándar de Google Maps
- **Función**: Punto de partida de todas las rutas

### 2. **Marcadores de Favoritos**
- **Forma**: Círculos personalizados
- **Tamaño**: 12px de radio (24px diámetro)
- **Color**: Único para cada favorito (del mismo color que su ruta)
- **Borde**: Blanco 2px para contraste
- **Label**: Número blanco, bold, 14px (1, 2, 3, ...)
- **Animación**: DROP (caen desde arriba al aparecer)

### 3. **Rutas Coloreadas**
- **Tipo**: Polylines con Google Directions API
- **Modo**: WALKING (caminando)
- **Grosor**: 4px
- **Opacidad**: 0.7 (70%)
- **Colores**: 8 colores únicos que se repiten cíclicamente

#### Paleta de Colores:
```javascript
1. #667eea - Púrpura
2. #f093fb - Rosa
3. #4facfe - Azul
4. #43e97b - Verde
5. #fa709a - Rosa oscuro
6. #fee140 - Amarillo
7. #30cfd0 - Turquesa
8. #a8edea - Verde agua
```

### 4. **InfoWindows**
Al hacer click en un marcador de favorito, se muestra:
- **Nombre del lugar**
- **Categoría** (historical, restaurants, nature, events)
- **Distancia** desde ubicación actual (si disponible)
- **Estilo**: Card blanco con sombra

---

## 🔄 Flujo Técnico

### Paso 1: Preparación
```javascript
1. Usuario hace click en Routes
2. Modal se muestra
3. Usuario hace click en "Got it!"
4. Modal se cierra
```

### Paso 2: Navegación
```javascript
5. RoutingModule.navigateTo('home')
   → Vista cambia al mapa principal
```

### Paso 3: Obtención de Datos
```javascript
6. FavoritesModule.getAllFavorites()
   → Obtiene lista de favoritos

7. MapaModule.getCurrentLocation()
   → Obtiene ubicación actual del usuario
```

### Paso 4: Limpieza
```javascript
8. MapaModule.clearMarkers()
   → Elimina marcadores previos

9. window.routeDirectionsRenderers.forEach(renderer => renderer.setMap(null))
   → Limpia rutas anteriores
```

### Paso 5: Creación de Bounds
```javascript
10. const bounds = new google.maps.LatLngBounds()
11. bounds.extend(userLatLng)
12. favorites.forEach(fav => bounds.extend(favLatLng))
```

### Paso 6: Marcador de Usuario
```javascript
13. MapaModule.addUserMarker(userLocation.lat, userLocation.lng)
    → Marcador azul en posición actual
```

### Paso 7: Bucle de Favoritos
Para cada favorito:
```javascript
14. Crear LatLng del favorito
15. Extender bounds
16. Crear marcador numerado con color único
17. Agregar InfoWindow
18. Crear DirectionsService
19. Crear DirectionsRenderer con color de ruta
20. Solicitar ruta (origin: usuario, destination: favorito, mode: WALKING)
21. Renderizar ruta en el mapa
```

### Paso 8: Ajuste Final
```javascript
22. setTimeout(() => {
23.   MapaModule.getMap().fitBounds(bounds)
24.   Agregar padding: {top: 100, right: 50, bottom: 150, left: 50}
25.   Mostrar notificación de éxito
26. }, 500)
```

---

## 📐 Cálculos Técnicos

### Bounds (Límites del Mapa)
```javascript
// Se calcula para incluir:
- Ubicación actual del usuario
- Todos los favoritos

// Resultado:
El mapa se ajusta automáticamente para mostrar todo el contenido
con un padding cómodo para visualización
```

### Rutas (Directions API)
```javascript
const request = {
    origin: userLatLng,           // Punto A: Usuario
    destination: favLatLng,       // Punto B: Favorito
    travelMode: 'WALKING'         // Modo: Caminando
};

// Google Maps calcula:
- Ruta más eficiente para caminar
- Distancia total
- Tiempo estimado
- Puntos de giro (turns)
```

### Colores (Asignación Cíclica)
```javascript
function getRouteColor(index) {
    const colors = [...]; // 8 colores
    return colors[index % colors.length];
}

// Ejemplos:
index 0 → colors[0] = '#667eea'
index 1 → colors[1] = '#f093fb'
index 8 → colors[0] = '#667eea' (se repite)
```

---

## 🎯 Casos de Uso

### Caso 1: 3 Favoritos Cercanos
```
Usuario en Petrer Centro
Favorito 1: Castillo (1.2 km) - Ruta púrpura
Favorito 2: Museo (0.8 km) - Ruta rosa
Favorito 3: Parque (1.5 km) - Ruta azul

Resultado:
→ Mapa centrado en la zona
→ 3 rutas visibles desde la posición actual
→ Marcadores numerados 1, 2, 3
→ Zoom adecuado para ver todo
```

### Caso 2: 10 Favoritos Dispersos
```
Usuario en Petrer Centro
10 favoritos en diferentes zonas de la ciudad

Resultado:
→ Mapa con zoom más alejado para incluir todo
→ 10 rutas con colores: 1-8 únicos, 9-10 repiten colores
→ Marcadores numerados 1-10
→ Padding automático para mejor visualización
```

### Caso 3: Sin Ubicación Disponible
```
Usuario no ha otorgado permisos de ubicación

Resultado:
→ Notificación: "Location not available. Please wait..."
→ Intento de obtener ubicación
→ Reintento automático después de 1 segundo
→ Si falla: mensaje de error
```

---

## 🔧 Manejo de Errores

### Error 1: Sin Ubicación
```javascript
if (!userLocation) {
    UIController.showNotification('Location not available. Please wait...', 'warning');
    MapaModule.getUserLocation(() => {
        setTimeout(() => showFavoritesRoutesOnMap(), 1000);
    });
    return;
}
```

### Error 2: Ruta No Disponible
```javascript
if (status !== google.maps.DirectionsStatus.OK) {
    console.warn(`⚠️ Could not draw route to ${fav.name}:`, status);
    // La ruta no se dibuja, pero los marcadores sí aparecen
}
```

### Error 3: Sin Coordenadas en Favorito
```javascript
if (!fav.coordinates) return; // Skip este favorito
```

---

## 💡 Optimizaciones

### Performance:
1. **Limpieza Eficiente**: Solo se limpian rutas cuando se necesita
2. **Timeout para Ajuste**: 500ms delay para que las rutas se dibujen antes de ajustar
3. **Bounds Dinámicos**: Solo incluye los puntos necesarios
4. **Suppress Markers**: No duplicar marcadores de Directions API

### UX:
1. **Animación DROP**: Marcadores caen suavemente
2. **Colores Distintos**: Fácil identificar cada ruta
3. **Numeración**: Ayuda a planificar orden de visita
4. **InfoWindows**: Información al alcance de un click

### Memoria:
1. **Array Global**: `window.routeDirectionsRenderers` para gestionar limpieza
2. **Clear on New**: Siempre limpiar antes de dibujar nuevas rutas
3. **SetMap(null)**: Eliminar correctamente los renderers

---

## 📱 Responsive

### Mobile:
- Padding ajustado para bottom-nav: `bottom: 150px`
- Marcadores visible en pantalla pequeña
- InfoWindows tamaño optimizado
- Touch-friendly (zoom con gestos)

### Tablet:
- Mejor aprovechamiento del espacio
- Múltiples rutas visibles simultáneamente
- Padding balanceado

### Desktop:
- Vista panorámica completa
- Hover effects en marcadores
- Scroll para zoom suave
- Padding optimizado

---

## 🎓 Aprendizajes Técnicos

### Google Maps Directions API:
- Requiere origen y destino como LatLng
- Soporta múltiples modos: DRIVING, WALKING, BICYCLING, TRANSIT
- Retorna polylines que se pueden estilizar
- Status codes: OK, NOT_FOUND, ZERO_RESULTS, etc.

### DirectionsRenderer:
- `suppressMarkers: true` → No muestra marcadores A/B por defecto
- `polylineOptions` → Personalizar color, grosor, opacidad de la ruta
- Cada ruta necesita su propio renderer
- Se debe guardar referencia para poder limpiar después

### Bounds & FitBounds:
- `LatLngBounds()` → Contenedor de coordenadas
- `extend(latLng)` → Agregar punto al bounds
- `fitBounds(bounds, padding)` → Ajustar mapa para mostrar todo
- Padding object: `{top, right, bottom, left}` en píxeles

---

## ✨ Resultado Visual Final

```
┌─────────────────────────────────────────┐
│  🗺️  MAPA                               │
│                                         │
│      [3] Parque ●──────┐                │
│                        │                │
│                    ╱───┘ (verde)        │
│                   ╱                     │
│      [1] Castillo ●                     │
│                  │ (púrpura)            │
│                  │                      │
│           📍 TÚ  │                      │
│                  │                      │
│                  │ (rosa)               │
│      [2] Museo  ●┘                      │
│                                         │
│  Showing routes to 3 favorite places ✓  │
└─────────────────────────────────────────┘
```

---

## 🎉 Conclusión

La visualización de rutas en el mapa proporciona una experiencia intuitiva y visualmente atractiva para que los usuarios puedan planificar sus visitas a lugares favoritos. La combinación de colores únicos, numeración clara y ajuste automático del mapa hace que la funcionalidad sea fácil de usar y entender.

**Estado**: ✅ **TOTALMENTE FUNCIONAL Y OPTIMIZADO**
