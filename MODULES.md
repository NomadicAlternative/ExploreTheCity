# Explore the City - Petrer
## Arquitectura Modular JavaScript

### 📁 Estructura de Módulos

La aplicación está dividida en **8 módulos** independientes y reutilizables:

```
js/
├── main.js                      # Archivo principal que coordina todos los módulos
└── modules/
    ├── MapaModule.js           # Gestión de Google Maps y marcadores
    ├── POIDataModule.js        # Datos y filtrado de lugares de interés
    ├── EventsModule.js         # Gestión de eventos (API externa)
    ├── FavoritesModule.js      # Sistema de favoritos con LocalStorage
    ├── UIController.js         # Control de interfaz y componentes UI
    ├── RoutingModule.js        # Navegación y routing dentro de la app
    └── ResponsiveModule.js     # Adaptación responsive móvil/desktop
```

---

## 📦 Descripción de Módulos

### 1. **MapaModule** (`MapaModule.js`)
**Responsabilidad:** Inicializa Google Maps, gestiona marcadores y eventos de clic.

**Funciones principales:**
- `initMap(containerId, options)` - Inicializa el mapa de Google Maps
- `addMarker(options)` - Agrega marcadores personalizados
- `addUserMarker(lat, lng)` - Marca ubicación del usuario
- `centerMap(lat, lng, zoom)` - Centra el mapa en coordenadas
- `getUserLocation(onSuccess, onError)` - Obtiene geolocalización
- `calculateDistance(lat1, lng1, lat2, lng2)` - Calcula distancias
- `filterMarkersByCategory(category)` - Filtra marcadores visibles

**Uso:**
```javascript
MapaModule.initMap('map', { zoom: 14 });
MapaModule.addMarker({
    position: { lat: 38.4836, lng: -0.7768 },
    title: 'Petrer Castle',
    onClick: (marker, data) => { /* callback */ }
});
```

---

### 2. **POIDataModule** (`POIDataModule.js`)
**Responsabilidad:** Obtiene, procesa y filtra datos de lugares de interés.

**Funciones principales:**
- `init()` - Inicializa con datos de muestra
- `getAllPOIs()` - Obtiene todos los POIs
- `getPOIById(id)` - Busca un POI específico
- `filterByCategory(category)` - Filtra por categoría única
- `filterByCategories(categories)` - Filtra por múltiples categorías
- `searchPOIs(searchTerm)` - Búsqueda por texto
- `sortByDistance(userLat, userLng)` - Ordena por proximidad
- `setCurrentPOI(poi)` / `getCurrentPOI()` - Gestiona POI activo
- `getNearbyPOIs(lat, lng, radiusKm)` - POIs cercanos a ubicación

**Uso:**
```javascript
POIDataModule.init();
const results = POIDataModule.searchPOIs('castle');
const nearby = POIDataModule.getNearbyPOIs(38.4836, -0.7768, 5);
```

---

### 3. **EventsModule** (`EventsModule.js`)
**Responsabilidad:** Conexión con API externa de eventos (Eventbrite, etc.)

**Funciones principales:**
- `init()` - Inicializa con eventos de muestra
- `getAllEvents()` - Obtiene todos los eventos
- `getUpcomingEvents(daysAhead)` - Eventos próximos
- `getPastEvents()` - Eventos pasados
- `filterByCategory(category)` - Filtra eventos por categoría
- `searchEvents(searchTerm)` - Búsqueda de eventos
- `formatEventDate(dateString)` - Formatea fechas
- `getEventStatus(dateString)` - Estado del evento (hoy, próximo, etc.)
- `fetchEventsFromAPI(apiUrl)` - Carga desde API externa

**Uso:**
```javascript
EventsModule.init();
const upcoming = EventsModule.getUpcomingEvents(30);
const formatted = EventsModule.formatEventDate('2025-05-15');
```

---

### 4. **FavoritesModule** (`FavoritesModule.js`)
**Responsabilidad:** Gestiona favoritos con LocalStorage y sincronización.

**Funciones principales:**
- `init()` - Carga favoritos desde localStorage
- `isFavorite(poiId)` - Verifica si es favorito
- `addFavorite(poi)` - Agrega a favoritos
- `removeFavorite(poiId)` - Elimina de favoritos
- `toggleFavorite(poi)` - Alterna estado de favorito
- `getAllFavorites()` - Obtiene todos los favoritos
- `clearAllFavorites()` - Limpia todos
- `searchFavorites(searchTerm)` - Busca en favoritos
- `sortByDate/Name/Rating()` - Ordenamiento
- `onChange(callback)` - Registra callback para cambios
- `exportFavorites()` / `importFavorites(json)` - Import/Export

**Uso:**
```javascript
FavoritesModule.init();
FavoritesModule.addFavorite(poi);
FavoritesModule.onChange((favorites) => {
    console.log('Favorites updated:', favorites);
});
```

---

### 5. **UIController** (`UIController.js`)
**Responsabilidad:** Control centralizado de la interfaz de usuario.

**Funciones principales:**
- `init()` - Inicializa el controlador UI
- `showView(viewName)` - Muestra una vista específica
- `openSidebar()` / `closeSidebar()` - Control del menú
- `updateFavoriteButton(isFavorite)` - Actualiza botón de favorito
- `updateFilterChips(activeCategory)` - Actualiza chips de filtro
- `updatePOICard(poi)` - Actualiza tarjeta de POI
- `showNotification(message, type, duration)` - Notificaciones toast
- `showLoading(show)` - Overlay de carga
- `setLocationButtonLoading(isLoading)` - Estado del botón GPS
- `isMobileDevice()` - Detecta si es móvil
- `getElement(name)` - Obtiene elemento del DOM cacheado

**Uso:**
```javascript
UIController.init();
UIController.showView('favorites');
UIController.showNotification('Success!', 'success', 3000);
UIController.updatePOICard(poi);
```

---

### 6. **RoutingModule** (`RoutingModule.js`)
**Responsabilidad:** Gestiona navegación y rutas SPA (Single Page App).

**Funciones principales:**
- `init()` - Inicializa sistema de routing
- `navigateTo(routeName, updateURL, data)` - Navega a una ruta
- `registerRoute(name, config)` - Registra nueva ruta
- `onRoute(routeName, callback)` - Callback para ruta específica
- `goBack()` - Vuelve atrás en historial
- `goHome()` - Va a página de inicio
- `getCurrentRoute()` - Ruta actual
- `getHistory()` - Historial de navegación
- `setRouteHandler(routeName, handler)` - Establece handler
- `navigateWithParams(routeName, params)` - Navega con query params
- `getQueryParams()` - Obtiene parámetros de URL
- `redirectExternal(url, newTab)` - Redirige externamente

**Uso:**
```javascript
RoutingModule.init();
RoutingModule.navigateTo('favorites');
RoutingModule.onRoute('home', (data) => {
    console.log('Home route activated');
});
```

---

### 7. **ResponsiveModule** (`ResponsiveModule.js`)
**Responsabilidad:** Ajusta UI según dispositivo y tamaño de pantalla.

**Funciones principales:**
- `init()` - Inicializa detección responsive
- `getCurrentBreakpoint()` - Breakpoint actual
- `isMobile()` / `isTablet()` / `isDesktop()` - Detectores de dispositivo
- `isTouchDevice()` - Detecta dispositivo táctil
- `getOrientation()` - Orientación (portrait/landscape)
- `getWindowDimensions()` - Dimensiones de ventana
- `onResize(callback)` - Callback para cambios de tamaño
- `onOrientationChange(callback)` - Callback para orientación
- `matchesMediaQuery(query)` - Verifica media query
- `getDeviceInfo()` - Información completa del dispositivo
- `refresh()` - Fuerza re-detección
- `registerBreakpoint(name, range)` - Breakpoint personalizado

**Breakpoints predefinidos:**
- `mobile-small`: max 374px
- `mobile`: 375px - 767px
- `tablet`: 768px - 1023px
- `desktop`: 1024px - 1439px
- `desktop-large`: 1440px+

**Uso:**
```javascript
ResponsiveModule.init();
if (ResponsiveModule.isMobile()) {
    // Lógica móvil
}
ResponsiveModule.onResize((dimensions, breakpoint) => {
    console.log('Resized to:', breakpoint);
});
```

---

### 8. **Main.js** (`main.js`)
**Responsabilidad:** Archivo principal que integra y coordina todos los módulos.

**Estructura:**
```javascript
const App = (() => {
    async function init() {
        // 1. Inicializar módulos
        ResponsiveModule.init();
        UIController.init();
        POIDataModule.init();
        EventsModule.init();
        FavoritesModule.init();
        RoutingModule.init();
        
        // 2. Configurar integraciones
        setupModuleIntegrations();
        
        // 3. Event listeners
        setupEventListeners();
    }
    
    return { init, initializeMap, removeFavorite };
})();

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
```

**Flujo de inicialización:**
1. ResponsiveModule y UIController (UI básica)
2. Módulos de datos (POIData, Events, Favorites)
3. RoutingModule (navegación)
4. Integraciones entre módulos
5. Event listeners globales
6. Inicialización de Google Maps (async)

---

## 🔗 Integraciones entre Módulos

### Favorites ↔ UI
```javascript
FavoritesModule.onChange((favorites) => {
    updateFavoriteUI();
});
```

### Routing ↔ UI
```javascript
RoutingModule.onRoute('home', () => {
    UIController.showView('home');
});
```

### Responsive ↔ UI
```javascript
ResponsiveModule.onResize(() => {
    UIController.showView(UIController.getCurrentView());
});
```

### POIData ↔ Map
```javascript
const pois = POIDataModule.getAllPOIs();
pois.forEach(poi => {
    MapaModule.addMarker({
        position: poi.coordinates,
        onClick: (marker, data) => handleMarkerClick(data)
    });
});
```

---

## 🚀 Cómo Usar

### Inicialización Básica
```javascript
// Se inicializa automáticamente al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

### Agregar Funcionalidad Nueva
```javascript
// 1. Usar módulo existente
const pois = POIDataModule.filterByCategory('restaurants');

// 2. Actualizar UI
UIController.updatePOICard(pois[0]);

// 3. Notificar usuario
UIController.showNotification('Restaurants loaded!');
```

### Google Maps Integration
```html
<!-- Agregar script de Google Maps con callback -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
```

```javascript
// El callback se ejecuta automáticamente
window.initMap = function() {
    App.initializeMap();
};
```

---

## 📱 Compatibilidad

- **Navegadores modernos** con soporte ES6 Modules
- **Chrome 61+**
- **Firefox 60+**
- **Safari 11+**
- **Edge 16+**

---

## 🔧 Próximas Mejoras

### Fase 1 (Actual)
- ✅ Estructura modular completa
- ✅ Sistema de favoritos con LocalStorage
- ✅ Routing SPA
- ✅ Responsive adaptativo

### Fase 2 (Próxima)
- ⏳ Integración con Google Maps API
- ⏳ Integración con Google Places API
- ⏳ API de eventos externa (Eventbrite)
- ⏳ Sistema de rutas de senderismo

### Fase 3 (Futuro)
- 🔜 PWA (Progressive Web App)
- 🔜 Modo offline
- 🔜 Sincronización en la nube
- 🔜 Sistema de comentarios y reviews

---

## 📝 Convenciones de Código

### Nombres de Funciones
- **Públicas:** camelCase sin prefijo
- **Privadas:** camelCase (no exportadas)
- **Callbacks:** prefijo `on` (ej: `onResize`, `onChange`)
- **Getters:** prefijo `get` (ej: `getCurrentPOI`)
- **Setters:** prefijo `set` (ej: `setCurrentPOI`)
- **Booleanos:** prefijo `is` o `has` (ej: `isMobile`, `hasPermission`)

### Estructura de Módulo
```javascript
export const ModuleName = (() => {
    // Variables privadas
    let privateVar = null;
    
    // Funciones privadas
    function privateFunction() { }
    
    // Funciones públicas
    function publicFunction() { }
    
    // API pública
    return {
        publicFunction
    };
})();
```

---

## 🐛 Debug y Testing

### Activar logs detallados
```javascript
// En la consola del navegador
localStorage.setItem('debug', 'true');
```

### Ver estado de módulos
```javascript
// Estado del routing
console.log(RoutingModule.getHistory());
console.log(RoutingModule.getCurrentRoute());

// Estado de favoritos
console.log(FavoritesModule.getAllFavorites());

// Información del dispositivo
console.log(ResponsiveModule.getDeviceInfo());
```

---

## 📄 Licencia

© 2025 - BYU Project - Explore the City

---

## 👥 Contribuciones

Para agregar nuevos módulos:

1. Crear archivo en `js/modules/NuevoModulo.js`
2. Seguir patrón IIFE con export
3. Importar en `main.js`
4. Inicializar en `App.init()`
5. Documentar en este README

---

**¿Preguntas?** Revisa la consola del navegador para logs detallados de cada módulo.
