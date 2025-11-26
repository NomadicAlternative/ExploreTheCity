# Integración de Eventos como Tarjetas POI

## 📋 Resumen
Se ha unificado la visualización de eventos para que **ambos** (filtro "Events" y menú "Events") usen la **misma fuente de datos** (Ticketmaster API) pero con diferentes formas de visualización.

## 🎯 Objetivo Logrado

### Antes:
- ❌ **Filtro "Events"** → Mostraba eventos en sección "Upcoming Events" (formato diferente)
- ❌ **Menú "Events"** → Mostraba eventos en sección "Upcoming Events" (formato especial)
- ❌ Comportamiento inconsistente

### Después:
- ✅ **Filtro "Events"** → Muestra eventos como **tarjetas POI** (igual que restaurantes/históricos)
- ✅ **Menú "Events"** → Muestra eventos en **sección "Upcoming Events"** (formato especial para eventos)
- ✅ Ambos usan **Ticketmaster API** como fuente única
- ✅ Datos consistentes, visualización adaptada al contexto

## 🔧 Cambios Implementados

### 1. **Nueva Función: `loadEventsAsPOIs()`**

```javascript
function loadEventsAsPOIs() {
    try {
        // Obtener eventos desde Ticketmaster
        const events = EventsModule.getNearbyEvents();
        
        // Convertir eventos a formato POI
        const eventPOIs = events.map(event => convertEventToPOI(event));
        
        // Actualizar mapa con marcadores de eventos
        updateMapMarkers(eventPOIs);
        
        // Mostrar eventos como tarjetas POI
        displayPOIsList(eventPOIs);
        
    } catch (error) {
        console.error('Error loading events:', error);
    }
}
```

**Propósito**: Carga eventos de Ticketmaster y los convierte a formato POI para mostrarlos en la lista de POIs.

### 2. **Nueva Función: `convertEventToPOI(event)`**

```javascript
function convertEventToPOI(event) {
    const date = EventsModule.formatEventDate(event.date);
    const time = EventsModule.formatEventTime(event.time);
    const location = event.location + (event.city ? ', ' + event.city : '');
    
    // Crear descripción con info del evento
    const description = `📅 ${date} at ${time} | 📍 ${location}`;
    
    // Determinar precio
    let priceInfo = '';
    if (event.priceRange) {
        priceInfo = `${event.priceRange.min}-${event.priceRange.max} ${event.priceRange.currency}`;
    }
    
    return {
        id: event.id,
        name: event.name,
        description: description,
        category: 'events',
        rating: 0, // Eventos no tienen rating
        totalRatings: 0,
        coordinates: event.coordinates,
        address: location,
        distance: event.distance,
        isOpen: null, // Eventos no tienen horario de apertura
        priceLevel: priceInfo, // Precio del evento
        photo: event.image || null,
        photos: event.image ? [event.image] : [],
        source: 'ticketmaster',
        url: event.url, // URL para comprar tickets ⭐
        eventDate: date,
        eventTime: time
    };
}
```

**Características Especiales del POI de Evento:**
- ✅ `category: 'events'` - Identifica que es un evento
- ✅ `rating: 0` - No tiene sistema de rating
- ✅ `url: event.url` - Link directo a la compra de tickets
- ✅ `description` - Incluye fecha, hora y ubicación formateada
- ✅ `priceLevel` - Rango de precio del evento

### 3. **Actualizada Función: `handleCategoryFilter(category)`**

```javascript
async function handleCategoryFilter(category) {
    // Si es eventos, cargar de Ticketmaster y mostrar como POIs
    if (category === 'events') {
        loadEventsAsPOIs(); // ⭐ CAMBIADO
        return;
    }
    
    // Para otras categorías, cargar desde Google Places
    await loadPOIsByCategory(category);
}
```

**Cambio**: Ahora llama a `loadEventsAsPOIs()` en lugar de `loadAndDisplayEvents()`.

### 4. **Actualizada Función: `createPOICardHTML(poi)`**

Se agregó lógica condicional para manejar eventos de manera especial:

```javascript
function createPOICardHTML(poi) {
    const isEvent = poi.category === 'events';
    
    // Para eventos, usar el precio directamente
    const priceLevel = isEvent ? 
        poi.priceLevel : 
        (poi.priceLevel ? POIDataModule.formatPriceLevel(poi.priceLevel) : '');
    
    return `
        <div class="poi-card-mobile poi-card-desktop" 
             data-poi-id="${poi.id}" 
             data-category="${poi.category}">
            
            ${poi.photo ? `
                <div class="poi-image" style="background-image: url('${poi.photo}')"></div>
            ` : ''}
            
            <div class="poi-header">
                <h3 class="poi-title">${poi.name}</h3>
                <button class="favorite-btn"...>❤️</button>
            </div>
            
            ${!isEvent && poi.rating > 0 ? `
                <div class="poi-rating">⭐⭐⭐⭐⭐</div>
            ` : ''}
            
            <p class="poi-description">${poi.description}</p>
            
            <div class="poi-details">
                <div class="detail-item">📍 ${distance}</div>
                ${priceLevel ? `<div class="detail-item">🎫 ${priceLevel}</div>` : ''}
            </div>
            
            <div class="poi-actions">
                ${isEvent && poi.url ? `
                    <a href="${poi.url}" target="_blank" class="action-btn event-ticket-btn">
                        🎫 Get Tickets
                    </a>
                ` : `
                    <button class="action-btn poi-directions-btn">
                        🧭 Directions
                    </button>
                `}
                <button class="action-btn poi-info-btn">ℹ️ More info</button>
            </div>
        </div>
    `;
}
```

**Diferencias para Eventos:**
1. **Sin Rating**: Los eventos no muestran estrellas de rating
2. **Icono de Ticket**: Usa `fa-ticket-alt` en lugar de `fa-euro-sign` para precio
3. **Botón "Get Tickets"**: Reemplaza el botón "Directions" con link directo a compra
4. **Color Verde**: Botón de tickets es verde en lugar de rojo

### 5. **Nuevos Estilos CSS**

```css
/* Botón especial para tickets de eventos */
.event-ticket-btn {
    background-color: #28a745; /* Verde */
    color: var(--white);
    text-decoration: none;
}

.event-ticket-btn:hover {
    background-color: #218838; /* Verde más oscuro */
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}
```

## 🎨 Visualización de Eventos

### Como Tarjeta POI (Filtro "Events"):
```
┌────────────────────────────────────┐
│  [Foto del Evento]                 │
├────────────────────────────────────┤
│  Nombre del Evento            [❤️] │
│                                    │
│  📅 Nov 30, 2025 at 20:00          │
│  📍 Teatro Principal, Petrer       │
│                                    │
│  📍 2.5 km  🎫 25-45 EUR           │
│                                    │
│  [🎫 Get Tickets]  [ℹ️ More info]  │
└────────────────────────────────────┘
```

### Como Tarjeta de Evento (Menú "Events"):
```
┌────────────────────────────────────┐
│  [Foto del Evento]                 │
│  ┌──────────────┐                  │
│  │ UPCOMING     │  📍 2.5 km       │
│  └──────────────┘                  │
│                                    │
│  Nombre del Evento                 │
│  Descripción detallada...          │
│                                    │
│  📅 Nov 30, 2025                   │
│  🕐 20:00                          │
│  📍 Teatro Principal, Petrer       │
│  🎫 25-45 EUR                      │
│                                    │
│  [🔗 Ver Tickets]                  │
└────────────────────────────────────┘
```

## 📊 Flujo de Datos

```
                    Ticketmaster API
                           ↓
                    EventsModule
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
    Filtro "Events"             Menú "Events"
              ↓                         ↓
    loadEventsAsPOIs()      loadAndDisplayEvents()
              ↓                         ↓
    convertEventToPOI()      Formato evento original
              ↓                         ↓
    createPOICardHTML()      createEventCardHTML()
              ↓                         ↓
    Tarjeta POI con          Tarjeta evento con
    botón "Get Tickets"      botón "Ver Tickets"
```

## ✅ Ventajas del Nuevo Sistema

### 1. **Consistencia de Datos**
- ✅ Una sola fuente: Ticketmaster API
- ✅ No hay duplicación de datos
- ✅ Siempre los mismos eventos

### 2. **Flexibilidad de Visualización**
- ✅ Eventos como POIs → Integrados con mapa
- ✅ Eventos en sección → Vista dedicada
- ✅ Usuario elige cómo ver

### 3. **Mejor Experiencia**
- ✅ Eventos aparecen en mapa como marcadores
- ✅ Se pueden mezclar con restaurantes/históricos
- ✅ Botón directo para comprar tickets
- ✅ Favoritos funcionan igual que con POIs

### 4. **Código Limpio**
- ✅ Funciones reutilizables
- ✅ Conversión clara de formato
- ✅ Fácil mantenimiento

## 🧪 Testing

### Caso 1: Filtro "Events"
1. Click en filtro "Events" → ✅ Carga eventos como POIs
2. Verificar tarjetas → ✅ Tienen foto, nombre, fecha/hora/ubicación
3. Click "Get Tickets" → ✅ Abre Ticketmaster en nueva pestaña
4. Click ❤️ favorito → ✅ Agrega a favoritos
5. Verificar mapa → ✅ Muestra marcadores de eventos

### Caso 2: Menú "Events"
1. Click menú hamburguesa → Click "Events" → ✅ Muestra sección "Upcoming Events"
2. Verificar tarjetas → ✅ Formato especial de evento
3. Click "Ver Tickets" → ✅ Abre Ticketmaster en nueva pestaña

### Caso 3: Ambos usan mismos datos
1. Cargar filtro "Events" → Contar eventos
2. Cargar menú "Events" → Contar eventos
3. Verificar → ✅ Mismo número y mismos eventos

## 🔄 Compatibilidad

### Funciones Existentes Preservadas:
- ✅ `loadAndDisplayEvents()` - Sigue funcionando para menú
- ✅ `EventsModule.getNearbyEvents()` - Sin cambios
- ✅ Sección "Upcoming Events" - Sin cambios
- ✅ Favoritos - Funciona con eventos

### Nuevas Funciones:
- ✅ `loadEventsAsPOIs()` - Carga eventos como POIs
- ✅ `convertEventToPOI()` - Convierte formato

## 📝 Notas Técnicas

### Identificación de Eventos:
```javascript
// Verificar si un POI es un evento
const isEvent = poi.category === 'events';
const isEvent = poi.source === 'ticketmaster';
```

### Datos Únicos de Eventos:
- `url` - Link a Ticketmaster
- `eventDate` - Fecha formateada
- `eventTime` - Hora formateada
- `priceLevel` - String con rango de precio

### Diferencias con POIs Regulares:
- No tienen `rating` ni `totalRatings`
- No tienen `isOpen` (horario)
- No usan `formatPriceLevel()` de POIDataModule
- Botón "Get Tickets" en lugar de "Directions"

---

**Fecha de implementación**: 26 de noviembre de 2025
**Versión**: 4.0
**Estado**: ✅ Completado y funcionando
**Fuente de datos**: Ticketmaster Discovery API
**Visualizaciones**: 2 (POI cards y Event cards)
