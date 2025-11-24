# Arquitectura del Proyecto - Explore the City

## 📊 Diagrama de Módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                          MAIN.JS                                │
│                   (Coordinador Principal)                       │
│  • Inicializa todos los módulos                                 │
│  • Configura integraciones entre módulos                        │
│  • Maneja event listeners globales                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─────────────────┬─────────────────┬────────────────┐
             │                 │                 │                │
    ┌────────▼────────┐  ┌─────▼──────┐  ┌──────▼──────┐  ┌─────▼─────┐
    │  UIController   │  │  Routing   │  │ Responsive  │  │  Mapa     │
    │                 │  │  Module    │  │  Module     │  │  Module   │
    │ • Control UI    │  │ • SPA      │  │ • Breakpts  │  │ • Google  │
    │ • Notificaciones│  │ • History  │  │ • Device    │  │   Maps    │
    │ • Modales       │  │ • Hash     │  │ • Resize    │  │ • Markers │
    └────────┬────────┘  └─────┬──────┘  └──────┬──────┘  └─────┬─────┘
             │                 │                 │                │
             └────────┬────────┴─────────────────┴────────────────┘
                      │
          ┌───────────┴───────────┬─────────────────┬──────────────┐
          │                       │                 │              │
    ┌─────▼──────┐        ┌──────▼──────┐   ┌─────▼──────┐  ┌───▼────┐
    │ POIData    │        │  Events     │   │ Favorites  │  │ Local  │
    │ Module     │        │  Module     │   │  Module    │  │Storage │
    │            │        │             │   │            │  │        │
    │ • CRUD POI │        │ • API       │   │ • Storage  │  │ (Data) │
    │ • Filtros  │        │ • Próximos  │   │ • CRUD     │  │        │
    │ • Búsqueda │        │ • Pasados   │   │ • Export   │  │        │
    └────────────┘        └─────────────┘   └────────────┘  └────────┘
```

---

## 🔄 Flujo de Datos

### 1. Inicialización de la App
```
Usuario abre app
    ↓
DOMContentLoaded
    ↓
App.init()
    ↓
┌─ ResponsiveModule.init()  → Detecta dispositivo
├─ UIController.init()      → Cachea elementos DOM
├─ POIDataModule.init()     → Carga datos POI
├─ EventsModule.init()      → Carga eventos
├─ FavoritesModule.init()   → Carga desde localStorage
└─ RoutingModule.init()     → Configura navegación
    ↓
setupModuleIntegrations()   → Conecta módulos
    ↓
setupEventListeners()       → Event listeners
    ↓
Mensaje de bienvenida
```

### 2. Búsqueda de Lugares
```
Usuario escribe en búsqueda
    ↓
handleSearch(searchTerm)
    ↓
POIDataModule.searchPOIs(term)
    ↓
updateMapMarkers(results)
    ↓
MapaModule.clearMarkers()
MapaModule.addMarker() × N
    ↓
UI actualizada con resultados
```

### 3. Filtrado por Categoría
```
Usuario selecciona categoría (chip/checkbox)
    ↓
handleCategoryFilter(category)
    ↓
POIDataModule.filterByCategory()
    ↓
updateMapMarkers(filtered)
    ↓
UIController.updateFilterChips()
    ↓
Mapa muestra solo POIs filtrados
```

### 4. Agregar a Favoritos
```
Usuario clic en botón ❤️
    ↓
toggleCurrentFavorite()
    ↓
POIDataModule.getCurrentPOI()
    ↓
FavoritesModule.toggleFavorite(poi)
    ↓
LocalStorage actualizado
    ↓
FavoritesModule.onChange() → callbacks
    ↓
UIController.updateFavoriteButton()
    ↓
UIController.showNotification("Added ❤️")
```

### 5. Geolocalización
```
Usuario clic en botón GPS
    ↓
getUserLocation()
    ↓
UIController.setLocationButtonLoading(true)
    ↓
MapaModule.getUserLocation()
    ↓
navigator.geolocation.getCurrentPosition()
    ↓
MapaModule.addUserMarker(lat, lng)
    ↓
POIDataModule.sortByDistance(lat, lng)
    ↓
updateMapMarkers(sorted)
    ↓
UIController.setLocationButtonLoading(false)
    ↓
Notificación de éxito
```

### 6. Navegación entre Vistas
```
Usuario clic en menú (Home/Favorites/Events/etc)
    ↓
RoutingModule.navigateTo(route)
    ↓
window.location.hash actualizado
    ↓
RoutingModule.executeCallbacks()
    ↓
UIController.showView(route)
    ↓
hideAllSections()
show[Route]View()
    ↓
Carga datos específicos de la vista
    ↓
Vista actualizada
```

### 7. Responsive Resize
```
Usuario cambia tamaño ventana
    ↓
ResponsiveModule.handleResize() (debounced)
    ↓
ResponsiveModule.detectBreakpoint()
    ↓
onBreakpointChange(old, new)
    ↓
ResponsiveModule.executeResizeCallbacks()
    ↓
UIController.showView(currentView)
    ↓
UI se adapta al nuevo tamaño
```

---

## 🎯 Responsabilidades de Cada Módulo

| Módulo | Responsabilidad | Dependencias |
|--------|----------------|--------------|
| **Main.js** | Coordinar e integrar módulos | Todos |
| **MapaModule** | Google Maps, marcadores, geolocalización | - |
| **POIDataModule** | Gestión de datos POI, filtros, búsqueda | - |
| **EventsModule** | Gestión de eventos, API externa | - |
| **FavoritesModule** | Favoritos, localStorage, sincronización | - |
| **UIController** | Elementos UI, notificaciones, vistas | ResponsiveModule |
| **RoutingModule** | Navegación SPA, historial, hash routing | UIController |
| **ResponsiveModule** | Breakpoints, device detection, resize | - |

---

## 📦 Comunicación entre Módulos

### Patrón Observer (Callbacks)
```javascript
// FavoritesModule notifica cambios
FavoritesModule.onChange((favorites) => {
    // UIController reacciona
    updateFavoriteUI();
});

// RoutingModule notifica navegación
RoutingModule.onRoute('home', () => {
    // UIController muestra vista
    UIController.showView('home');
});

// ResponsiveModule notifica resize
ResponsiveModule.onResize((dimensions, breakpoint) => {
    // UIController se adapta
    UIController.refresh();
});
```

### Patrón Facade (Interfaz Unificada)
```javascript
// UIController abstrae complejidad del DOM
UIController.showNotification('Message', 'success');
// vs
// Crear elemento, estilos, animaciones, timeout, remove...

// MapaModule abstrae Google Maps API
MapaModule.addMarker({ position, onClick });
// vs
// new google.maps.Marker, addListener, setMap, etc...
```

### Patrón Module (Encapsulación)
```javascript
// Variables privadas no accesibles desde fuera
export const MyModule = (() => {
    let privateData = []; // ✅ Privado
    
    function privateFunction() { } // ✅ Privado
    
    function publicFunction() { } // ✅ Público (en return)
    
    return { publicFunction };
})();
```

---

## 🔧 Extensibilidad

### Agregar Nuevo Módulo

**1. Crear archivo:** `js/modules/NuevoModulo.js`
```javascript
export const NuevoModulo = (() => {
    function init() {
        console.log('✅ NuevoModulo initialized');
    }
    
    return { init };
})();
```

**2. Importar en main.js:**
```javascript
import { NuevoModulo } from './modules/NuevoModulo.js';
```

**3. Inicializar:**
```javascript
async function init() {
    // ...otros módulos
    NuevoModulo.init();
}
```

**4. Integrar:**
```javascript
function setupModuleIntegrations() {
    NuevoModulo.onEvent(() => {
        UIController.updateUI();
    });
}
```

---

## 🚀 Ventajas de esta Arquitectura

### ✅ Modularidad
- Cada módulo tiene una responsabilidad única
- Fácil de entender y mantener
- Código reutilizable

### ✅ Testabilidad
- Módulos independientes fáciles de testear
- Mock de dependencias sencillo
- Pruebas unitarias por módulo

### ✅ Escalabilidad
- Agregar funcionalidades sin romper existentes
- Reemplazar módulos sin afectar otros
- Crecimiento ordenado del proyecto

### ✅ Mantenibilidad
- Bugs aislados en módulos específicos
- Refactoring seguro
- Documentación clara

### ✅ Separación de Responsabilidades
- UI separada de lógica de negocio
- Datos separados de presentación
- Facilita trabajo en equipo

---

## 📚 Próximos Pasos

### Fase 1: APIs Externas
- [ ] Integrar Google Maps JavaScript API
- [ ] Conectar Google Places API para búsqueda
- [ ] API de eventos (Eventbrite/Ticketmaster)
- [ ] API de clima (OpenWeatherMap)

### Fase 2: Features Avanzadas
- [ ] Módulo de Rutas de Senderismo
- [ ] Sistema de Reviews y Comentarios
- [ ] Compartir en redes sociales
- [ ] Modo oscuro

### Fase 3: Progressive Web App
- [ ] Service Worker para offline
- [ ] Caché de assets
- [ ] App installable
- [ ] Push notifications

### Fase 4: Backend
- [ ] Autenticación de usuarios
- [ ] Sincronización en la nube
- [ ] API REST propia
- [ ] Base de datos

---

## 📝 Notas de Implementación

### Estado Actual (✅ Completado)
- [x] Estructura modular completa
- [x] 8 módulos funcionando
- [x] Sistema de favoritos con localStorage
- [x] Routing SPA con hash navigation
- [x] Responsive adaptativo
- [x] UI Controller centralizado
- [x] Integraciones entre módulos
- [x] Documentación completa

### En Desarrollo (🚧)
- [ ] Google Maps API integration
- [ ] Búsqueda real con Places API
- [ ] API de eventos externa

### Pendiente (📋)
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] PWA setup
- [ ] Backend API

---

**Versión:** 1.0  
**Última actualización:** 24 de noviembre de 2025  
**Estado:** ✅ Estructura modular completa y funcional
