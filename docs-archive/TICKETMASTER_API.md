# 🎫 Integración con Ticketmaster API

## Configuración

La aplicación **Explore the City** ahora está integrada con **Ticketmaster Discovery API** para mostrar eventos en vivo cercanos a tu ubicación.

### Credenciales API

```javascript
Consumer Key: V8dYTT7pnhAV3Lf0aY2UDjJDwdhFrA5d
Consumer Secret: GAKV1nB2T6kk7JPL
```

### Límites de la API

- **Public APIs**: 5000 requests cada 1 día
- **OAuth Product**: 100 requests cada 1 minuto

---

## Características Implementadas

### ✅ **1. Detección Automática de Ubicación**
- La app detecta automáticamente tu ubicación al cargar
- Si falla, usa ubicación por defecto: Petrer, España (38.4836, -0.7768)
- Puedes actualizar tu ubicación manualmente con `EventsModule.setUserLocation(lat, lng)`

### ✅ **2. Eventos Ordenados por Distancia**
- Los eventos se ordenan por cercanía a tu ubicación
- **Sin límite de distancia** - muestra todos los eventos disponibles
- Radio de búsqueda inicial: 200 km (expandible)

### ✅ **3. Información Completa de Eventos**
Cada evento incluye:
- 📅 **Fecha y hora**
- 📍 **Ubicación** (venue + coordenadas)
- 🗺️ **Distancia** desde tu ubicación
- 💰 **Rango de precios**
- 🎭 **Categoría y género** (Música, Deportes, Teatro, etc.)
- 🖼️ **Imágenes** de alta calidad
- 🔗 **Link directo** para comprar tickets

### ✅ **4. Filtros y Búsqueda**
- Filtrar por categoría (música, deportes, teatro, etc.)
- Búsqueda por nombre, descripción, ubicación
- Filtrar por rango de precios
- Ver eventos de una fecha específica

### ✅ **5. Integración con Mapa**
- Los eventos con coordenadas se muestran en el mapa
- Click en evento muestra detalles completos
- Navegación directa a Google Maps

---

## Uso del Módulo

### Inicialización Automática

```javascript
import { EventsModule } from './modules/EventsModule.js';

// Se inicializa automáticamente al cargar la app
await EventsModule.init();
```

### Obtener Eventos

```javascript
// Todos los eventos
const allEvents = EventsModule.getAllEvents();

// Eventos cercanos (ordenados por distancia)
const nearbyEvents = EventsModule.getNearbyEvents(); // Sin límite
const nearby50km = EventsModule.getNearbyEvents(50); // Máximo 50km

// Eventos próximos (siguiente mes)
const upcoming = EventsModule.getUpcomingEvents(30);

// Buscar eventos
const searchResults = EventsModule.searchEvents('concierto');

// Filtrar por categoría
const musicEvents = EventsModule.filterByCategory('music');
```

### Actualizar Ubicación

```javascript
// Establecer ubicación manualmente
await EventsModule.setUserLocation(40.4168, -3.7038); // Madrid

// Refrescar eventos con nueva búsqueda
await EventsModule.refreshEvents({
    radius: 300, // 300 km
    size: 100    // 100 eventos
});

// Buscar por ciudad
await EventsModule.searchEventsByCity('Barcelona');
```

### Información de Eventos

```javascript
const event = EventsModule.getEventById('event-id');

// Formatear información
const formattedDate = EventsModule.formatEventDate(event.date);
const formattedTime = EventsModule.formatEventTime(event.time);
const formattedDistance = EventsModule.formatDistance(event.distance);

// Estado del evento
const status = EventsModule.getEventStatus(event.date); // 'today', 'this-week', etc.
const statusText = EventsModule.getStatusText(status); // 'Hoy', 'Esta semana', etc.
```

### Estadísticas

```javascript
const stats = EventsModule.getEventStats();
console.log(stats);
// {
//   total: 50,
//   upcoming: 45,
//   today: 2,
//   thisWeek: 8,
//   byCategory: { music: 20, sports: 15, theatre: 10, other: 5 },
//   hasLocation: 48
// }
```

---

## Estructura de Datos de Evento

```javascript
{
  id: "vvG1YZKS3z_3h5",
  name: "Coldplay - Music of the Spheres World Tour",
  description: "Music event - Rock",
  date: "2025-06-15",
  time: "20:30:00",
  datetime: "2025-06-15T20:30:00Z",
  location: "Estadio Santiago Bernabéu",
  address: "Av. de Concha Espina, 1",
  city: "Madrid",
  coordinates: {
    lat: 40.4530,
    lng: -3.6883
  },
  distance: 3.2, // km desde tu ubicación
  category: "music",
  genre: "Rock",
  segment: "Music",
  image: "https://s1.ticketm.net/dam/a/...",
  images: ["url1", "url2", ...],
  url: "https://www.ticketmaster.es/event/...",
  ticketUrl: "https://www.ticketmaster.es/event/...",
  priceRange: {
    min: 45.00,
    max: 150.00,
    currency: "EUR"
  },
  status: "onsale",
  organizer: "Live Nation",
  venue: {
    name: "Estadio Santiago Bernabéu",
    address: "Av. de Concha Espina, 1",
    city: "Madrid",
    state: "Madrid",
    country: "España",
    postalCode: "28036"
  }
}
```

---

## Categorías de Eventos

| Ticketmaster | App Category |
|-------------|--------------|
| Music | `music` |
| Sports | `sports` |
| Arts & Theatre | `theatre` |
| Film | `film` |
| Family | `family` |
| Miscellaneous | `other` |

---

## API Endpoints Utilizados

### Events Discovery
```
GET https://app.ticketmaster.com/discovery/v2/events.json
```

**Parámetros:**
- `apikey`: Tu API Key
- `latlong`: "lat,lng" - Tu ubicación
- `radius`: Radio en km (default: 200)
- `unit`: "km" o "miles"
- `locale`: "es-ES" (español)
- `countryCode`: "ES" (España)
- `size`: Número de resultados (1-200)
- `sort`: "distance,asc" (más cercano primero)

---

## Manejo de Errores

```javascript
try {
  const events = await EventsModule.refreshEvents();
  console.log(`✅ ${events.length} eventos cargados`);
} catch (error) {
  console.error('❌ Error cargando eventos:', error);
  // La app maneja automáticamente:
  // - Errores de API
  // - Problemas de red
  // - Límites de rate
  // - Sin ubicación
}
```

---

## Rate Limiting

La app implementa manejo inteligente de requests:

1. **Caché automático**: Los eventos se cachean en memoria
2. **Detección de ubicación única**: Solo al inicio o cuando cambies ubicación
3. **Refresh manual**: Usa `refreshEvents()` solo cuando sea necesario
4. **Límite diario**: 5000 requests/día = ~3-4 requests/minuto continuos

---

## Testing

### Probar con diferentes ubicaciones

```javascript
// Madrid
await EventsModule.setUserLocation(40.4168, -3.7038);

// Barcelona
await EventsModule.setUserLocation(41.3851, 2.1734);

// Valencia
await EventsModule.setUserLocation(39.4699, -0.3763);

// Tu ubicación actual
navigator.geolocation.getCurrentPosition(pos => {
  EventsModule.setUserLocation(
    pos.coords.latitude,
    pos.coords.longitude
  );
});
```

### Probar búsquedas

```javascript
// Por radio
await EventsModule.refreshEvents({ radius: 50 }); // 50km

// Por cantidad
await EventsModule.refreshEvents({ size: 100 }); // 100 eventos

// Por ciudad
await EventsModule.searchEventsByCity('Alicante');
```

---

## Mejoras Futuras

### Posibles adiciones:
- [ ] Filtro por rango de fechas
- [ ] Filtro por rango de precios (UI)
- [ ] Favoritos de eventos
- [ ] Notificaciones de eventos cercanos
- [ ] Compartir eventos
- [ ] Agregar a calendario
- [ ] Modo offline con caché persistente
- [ ] Búsqueda por artista/equipo

---

## Recursos

- [Ticketmaster Discovery API Docs](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- [API Explorer](https://developer.ticketmaster.com/api-explorer/v2/)
- [Rate Limits](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)

---

## Soporte

Para problemas con la API:
- Dashboard: https://developer-acct.ticketmaster.com/
- App Name: `dagc40-App`
- Docs: https://developer.ticketmaster.com/

---

**¡La integración está lista y funcionando! 🎉**

Los eventos se cargan automáticamente al iniciar la app y se muestran ordenados por distancia desde tu ubicación.
