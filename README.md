# 🏰 Explore the City - Petrer

Aplicación web para explorar lugares turísticos y locales en Petrer, España.

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/NomadicAlternative/ExploreTheCity.git
cd ExploreTheCity
```

### 2. Configurar Google Maps API Key

#### Obtener API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API
   - Geolocation API
4. Crea una API Key en "Credenciales"

#### Configurar en el proyecto
```bash
# Copia el archivo de ejemplo
cp js/config.example.js js/config.js

# Edita js/config.js y reemplaza YOUR_API_KEY con tu clave real
```

**O edita directamente:**
```javascript
// js/config.js
const GOOGLE_MAPS_CONFIG = {
    apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ← Tu API Key aquí
    // ...
};
```

### 3. Ejecutar la aplicación

#### Opción A: Abrir directamente (desarrollo simple)
```bash
open index.html
```

#### Opción B: Servidor local (recomendado)
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Luego visita: http://localhost:8000

---

## 📁 Estructura del Proyecto

```
ExploreTheCity/
├── index.html                  # Página principal
├── css/
│   └── styles.css              # Estilos de la aplicación
├── js/
│   ├── config.js              # ⚠️ Tu API Key (no subir a GitHub)
│   ├── config.example.js      # Ejemplo de configuración
│   ├── main.js                # Coordinador principal
│   └── modules/
│       ├── MapaModule.js      # Google Maps y marcadores
│       ├── POIDataModule.js   # Gestión de lugares de interés
│       ├── EventsModule.js    # Sistema de eventos
│       ├── FavoritesModule.js # Favoritos con localStorage
│       ├── UIController.js    # Control de interfaz
│       ├── RoutingModule.js   # Navegación SPA
│       └── ResponsiveModule.js # Responsive adaptativo
├── images/
│   └── logo.webp              # Logo de la aplicación
└── docs/
    ├── MODULES.md             # Documentación de módulos
    ├── ARCHITECTURE.md        # Arquitectura del proyecto
    ├── GOOGLE_MAPS_SETUP.md   # Guía de Google Maps
    └── QUICK_START.md         # Guía rápida
```

---

## ✨ Características

### 🗺️ Mapa Interactivo
- Mapa de Google Maps con Petrer, España
- Marcadores de lugares de interés
- Geolocalización del usuario
- Cálculo de distancias

### 📍 Lugares de Interés (POIs)
- Filtrado por categorías
- Búsqueda en tiempo real
- Información detallada
- Direcciones en Google Maps

### ❤️ Sistema de Favoritos
- Guardar lugares favoritos
- Persistencia con localStorage
- Gestión completa (CRUD)
- Export/Import de favoritos

### 📅 Eventos
- Eventos próximos
- Filtrado por categoría
- Información detallada
- (Preparado para API externa)

### 🎨 Interfaz Adaptativa
- Diseño responsive
- Vista móvil optimizada
- Vista desktop completa
- Navegación fluida (SPA)

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Mapa:** Google Maps JavaScript API
- **Arquitectura:** Módulos ES6, Patrón IIFE
- **Storage:** localStorage
- **Routing:** Hash-based SPA

---

## 📖 Documentación

- **[QUICK_START.md](QUICK_START.md)** - Guía rápida de uso
- **[MODULES.md](MODULES.md)** - Documentación de módulos
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del proyecto
- **[GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)** - Integración de Google Maps

---

## 🧪 Verificación

Después de configurar, verifica en la consola:

```
✅ ResponsiveModule initialized
✅ UIController initialized
✅ POIDataModule initialized with 3 POIs
✅ EventsModule initialized with 3 events
✅ FavoritesModule initialized
✅ RoutingModule initialized
✅ Explore the City initialized successfully
📍 Google Maps API loaded
✅ Google Maps initialized
```

---

## 🔒 Seguridad

### ⚠️ Importante
- El archivo `js/config.js` está en `.gitignore`
- **NO subas tu API Key a GitHub**
- Usa `config.example.js` como plantilla
- Configura restricciones en Google Cloud Console

### Para Producción
1. Usa variables de entorno
2. Implementa backend proxy
3. Configura restricciones de dominio
4. Monitorea el uso de API

---

## 🐛 Solución de Problemas

### El mapa no carga
1. Verifica que tu API Key sea correcta
2. Asegúrate de haber habilitado las APIs necesarias
3. Revisa la consola del navegador (F12)
4. Consulta [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)

### Error "Google is not defined"
- El script de Google Maps no se cargó
- Verifica tu conexión a internet
- Revisa que el archivo `config.js` exista

### Marcadores no aparecen
- Abre la consola y busca errores
- Verifica que `POIDataModule` tenga datos
- Asegúrate de que el mapa se haya inicializado

---

## 🚀 Próximas Características

- [ ] Integración con Places API para búsqueda real
- [ ] API de eventos externa (Eventbrite)
- [ ] Sistema de rutas de senderismo
- [ ] Modo offline (PWA)
- [ ] Backend y autenticación
- [ ] Sistema de reviews

---

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de un proyecto académico de BYU.

---

## 📞 Contacto

**Diego García**
- GitHub: [@NomadicAlternative](https://github.com/NomadicAlternative)
- Proyecto: [ExploreTheCity](https://github.com/NomadicAlternative/ExploreTheCity)

---

## 🎓 Proyecto Académico

Este proyecto fue desarrollado como parte del curso de desarrollo web de BYU.

**Institución:** Brigham Young University  
**Curso:** Desarrollo Web  
**Período:** 6º término - 2025

---

**¡Disfruta explorando Petrer! 🏰**
