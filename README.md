# 🏰 Explore the City - Petrer

Una aplicación web moderna para explorar lugares de interés turístico y eventos en vivo en Petrer y alrededores.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Características

### 🗺️ **Mapa Interactivo**
- Google Maps integrado con ubicación en Petrer, España
- Marcadores personalizados por categoría
- Geolocalización del usuario
- Navegación y direcciones

### 📍 **Lugares de Interés (POIs)**
- Castillo de Petrer
- Restaurantes locales
- Rutas de naturaleza
- Filtrado por categorías
- Búsqueda en tiempo real
- Ordenamiento por distancia

### 🎫 **Eventos en Vivo** (Powered by Ticketmaster)
- Eventos cercanos ordenados por distancia
- Sin límite de distancia
- Información completa de eventos
- Imágenes de alta calidad
- Links directos para comprar tickets
- Filtros por categoría y precio

### ❤️ **Sistema de Favoritos**
- Guardar lugares favoritos
- Persistencia con LocalStorage
- Búsqueda y filtrado de favoritos
- Exportar/Importar favoritos

### 📱 **Diseño Responsive**
- Mobile First
- Tablet optimizado
- Desktop de 2 columnas
- Splash screen animado

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet
- Google Maps API Key
- Ticketmaster API Key (incluida)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/NomadicAlternative/ExploreTheCity.git
cd ExploreTheCity
```

2. **Configurar Google Maps API**
```bash
# Copiar archivo de configuración
cp js/config.example.js js/config.js

# Editar js/config.js y agregar tu API Key
# Obtener API Key en: https://console.cloud.google.com/
```

3. **Abrir la aplicación**
```bash
# Opción 1: Abrir directamente
open index.html

# Opción 2: Usar Live Server (recomendado)
# Instalar extensión Live Server en VS Code
# Click derecho en index.html > Open with Live Server
```

### Configuración de Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API (opcional, para futuras mejoras)
   - Geocoding API (opcional)
4. Crea credenciales (API Key)
5. Copia tu API Key en `js/config.js`:

```javascript
window.GOOGLE_MAPS_CONFIG = {
    apiKey: 'TU_API_KEY_AQUI',
    defaultCenter: { lat: 38.4836, lng: -0.7768 }, // Petrer
    defaultZoom: 14,
    libraries: ['places'],
    mapOptions: {
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    }
};
```

---

## 📁 Estructura del Proyecto

```
ExploreTheCity/
├── index.html                      # Página principal
├── test-ticketmaster.html          # Página de pruebas API
├── README.md                       # Este archivo
├── TICKETMASTER_API.md            # Documentación API Ticketmaster
├── TICKETMASTER_INTEGRATION_SUMMARY.md  # Resumen integración
│
├── css/
│   └── styles.css                 # Estilos completos responsive
│
├── js/
│   ├── config.example.js          # Plantilla de configuración
│   ├── config.js                  # Configuración (NO en git)
│   ├── main.js                    # Controlador principal
│   │
│   └── modules/
│       ├── MapaModule.js          # Google Maps
│       ├── POIDataModule.js       # Lugares de interés
│       ├── EventsModule.js        # Ticketmaster API
│       ├── FavoritesModule.js     # LocalStorage
│       ├── UIController.js        # Interfaz de usuario
│       ├── RoutingModule.js       # Navegación
│       └── ResponsiveModule.js    # Breakpoints
│
└── images/
    ├── logo.webp                  # Logo de la app
    └── (otras imágenes)
```

---

## 🎯 Uso

### Navegación Principal

#### **Home** 🏠
- Vista del mapa con lugares marcados
- Tarjeta de información del lugar seleccionado
- Botón de geolocalización
- Filtros rápidos por categoría

#### **Favoritos** ❤️
- Lista de lugares guardados
- Búsqueda en favoritos
- Ordenar por nombre, fecha, rating
- Eliminar favoritos

#### **Eventos** 🎫
- Eventos cercanos ordenados por distancia
- Información completa con imágenes
- Filtros por categoría y precio
- Links directos a Ticketmaster

#### **Rutas** 🥾
- Rutas de senderismo (próximamente)
- Información de dificultad y distancia

### Atajos de Teclado

- `Ctrl/Cmd + F`: Buscar lugares
- `Esc`: Cerrar menú lateral
- `Tab`: Navegar por elementos

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables
- **JavaScript ES6+** - Módulos, async/await, fetch
- **Font Awesome 6** - Iconografía
- **Google Fonts (Roboto)** - Tipografía

### APIs y Servicios
- **Google Maps JavaScript API** - Mapas interactivos
- **Ticketmaster Discovery API** - Eventos en vivo
- **Geolocation API** - Ubicación del usuario
- **LocalStorage API** - Persistencia de datos

### Arquitectura
- **Patrón Modular** - Código organizado en módulos
- **Revealing Module Pattern** - Encapsulación
- **Observer Pattern** - Callbacks y eventos
- **Mobile First** - Diseño responsive

---

## 📊 APIs Integradas

### Google Maps API
- **Propósito**: Visualización de mapas y marcadores
- **Documentación**: [Google Maps Platform](https://developers.google.com/maps)
- **Configuración**: `js/config.js`

### Ticketmaster Discovery API
- **Propósito**: Eventos en vivo cercanos
- **Documentación**: [Ticketmaster Docs](https://developer.ticketmaster.com/)
- **API Key**: Incluida en el código
- **Límites**: 5000 requests/día
- **Guía completa**: Ver `TICKETMASTER_API.md`

---

## 🧪 Testing

### Página de Pruebas
```bash
open test-ticketmaster.html
```

Funcionalidades de testing:
- ✅ Test de ubicación actual
- ✅ Test de ubicación personalizada
- ✅ Refresh de eventos con radio custom
- ✅ Búsqueda por ciudad
- ✅ Visualización de estadísticas

### Consola del Navegador
```javascript
// Módulos disponibles globalmente
App.init()
EventsModule.getAllEvents()
FavoritesModule.getAllFavorites()
MapaModule.getMap()
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Rango | Dispositivos |
|------------|-------|--------------|
| `mobile-small` | < 375px | iPhone SE, pequeños |
| `mobile` | 375px - 767px | iPhone, Android |
| `tablet` | 768px - 1023px | iPad, tablets |
| `desktop` | 1024px - 1439px | Laptops |
| `desktop-large` | ≥ 1440px | Monitores grandes |

### Layout Desktop (≥1366px)
- Body: 70% del viewport centrado
- Grid de 2 columnas: Mapa + Sidebar
- 3 columnas para listas de eventos

---

## 🎨 Paleta de Colores

```css
--primary-color: #3D5A80      /* Azul oscuro */
--secondary-color: #98C1D9    /* Azul claro */
--accent-color-1: #EE6C4D     /* Naranja/coral */
--accent-color-2: #293241     /* Negro azulado */
--text-color: #010101         /* Negro */
--white: #FFFFFF              /* Blanco */
--light-gray: #F5F5F5         /* Gris claro */
```

---

## 🔒 Seguridad

### API Keys
- **NO** incluir `js/config.js` en el repositorio
- Usar variables de entorno en producción
- Restringir API Keys por dominio
- Habilitar solo APIs necesarias

### Best Practices
- HTTPS obligatorio en producción
- Validación de datos de usuario
- Sanitización de inputs
- Rate limiting en requests

---

## 🚧 Roadmap

### Versión 1.1 (Próximamente)
- [ ] Google Places API para POIs reales
- [ ] Filtros avanzados con UI (sliders, dropdowns)
- [ ] Sistema de reviews y ratings
- [ ] Compartir lugares y eventos

### Versión 2.0 (Futuro)
- [ ] Progressive Web App (PWA)
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Autenticación de usuarios
- [ ] Backend con base de datos
- [ ] API propia

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo
- ES6+ para JavaScript
- Comentarios descriptivos con emojis
- Nombres de funciones en camelCase
- Nombres de variables descriptivos
- Indentación: 4 espacios

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Diego García**
- GitHub: [@NomadicAlternative](https://github.com/NomadicAlternative)
- Email: dagc40@byu.edu
- Proyecto: BYU - 6th Term

---

## 🙏 Agradecimientos

- [Google Maps Platform](https://developers.google.com/maps) - Mapas interactivos
- [Ticketmaster](https://developer.ticketmaster.com/) - API de eventos
- [Font Awesome](https://fontawesome.com/) - Iconografía
- [Google Fonts](https://fonts.google.com/) - Tipografía Roboto
- BYU - Educación y recursos

---

## 📞 Soporte

¿Tienes preguntas o problemas?

1. Revisa la [documentación](#-documentación)
2. Abre un [Issue](https://github.com/NomadicAlternative/ExploreTheCity/issues)
3. Contacta por email: dagc40@byu.edu

---

## 📸 Capturas de Pantalla

### Mobile
```
┌─────────────────┐
│   🏰 Logo       │
│   Petrer, Spain │
│ [Search......] │
├─────────────────┤
│ [All][🏛️][🍽️]  │
│ [🌲][📅]        │
├─────────────────┤
│                 │
│      MAPA       │
│                 │
├─────────────────┤
│ Historical Place│
│ ⭐⭐⭐⭐☆ (4.0) │
│ Description...  │
│ 📍 0.5 km      │
│ [Favorites]     │
└─────────────────┘
```

### Desktop (70% width)
```
┌────────────────────────────────────────────────────────────┐
│  🏰 Explore the City          [Home][About][Contact][Sign in]│
├──────────────────────────────┬─────────────────────────────┤
│                              │  Filters                    │
│   [Search...............]    │  ☑️ Historical places       │
│                              │  ☐ Mountain routes          │
│   ┌─────────────────────┐   │  ☐ Restaurants              │
│   │                     │   │                             │
│   │       MAPA          │   │  POI Card                   │
│   │                     │   │  ┌───────────────────────┐ │
│   │                     │   │  │ Historical Place      │ │
│   └─────────────────────┘   │  │ ⭐⭐⭐⭐☆             │ │
│                              │  │ Description...        │ │
│                              │  │ [Favorites]           │ │
│                              │  └───────────────────────┘ │
└──────────────────────────────┴─────────────────────────────┘
```

---

## 🎓 Proyecto Académico

Este proyecto fue desarrollado como parte del **6º trimestre** en **Brigham Young University (BYU)**.

### Objetivos Cumplidos
- ✅ Estructura modular profesional
- ✅ Integración con APIs externas
- ✅ Diseño responsive completo
- ✅ Persistencia de datos local
- ✅ Geolocalización funcional
- ✅ UI/UX moderna y pulida

---

**🏰 Explora Petrer con nosotros - Discover, Explore, Enjoy! 🎉**
