# 🗺️ Guía de Integración de Google Maps API

## 📋 Checklist de Integración

- [ ] Obtener API Key de Google Maps
- [ ] Habilitar APIs necesarias
- [ ] Configurar archivo config.js
- [ ] Verificar que el script se carga correctamente
- [ ] Probar funcionalidad del mapa

---

## 🔑 Paso 1: Obtener Google Maps API Key

### 1.1 Ir a Google Cloud Console
Visita: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 1.2 Crear o Seleccionar Proyecto
1. Haz clic en el menú desplegable de proyectos
2. Crea un nuevo proyecto llamado "ExploreTheCity" o usa uno existente

### 1.3 Habilitar APIs Necesarias
Ve a **APIs y Servicios > Biblioteca** y habilita:

- ✅ **Maps JavaScript API** (obligatorio)
- ✅ **Places API** (para búsquedas)
- ✅ **Geolocation API** (para ubicación del usuario)
- ✅ **Geocoding API** (opcional - para direcciones)
- ✅ **Directions API** (opcional - para rutas)

### 1.4 Crear API Key
1. Ve a **APIs y Servicios > Credenciales**
2. Haz clic en **Crear credenciales > Clave de API**
3. Copia tu API Key (se verá como: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 1.5 Configurar Restricciones (Recomendado)
1. Haz clic en tu API Key recién creada
2. En **Restricciones de aplicación**:
   - Para desarrollo: Deja "Ninguno"
   - Para producción: Selecciona "Referentes HTTP" y agrega tu dominio
3. En **Restricciones de API**:
   - Selecciona "Restringir clave"
   - Marca solo las APIs que habilitaste arriba

---

## ⚙️ Paso 2: Configurar el Proyecto

### 2.1 Configurar API Key

Tienes **2 opciones**:

#### **Opción A: Archivo config.js (Recomendado para desarrollo)**

1. Abre el archivo `js/config.js`
2. Reemplaza `YOUR_API_KEY` con tu API Key real:

```javascript
const GOOGLE_MAPS_CONFIG = {
    apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ← Tu API Key aquí
    // ... resto de configuración
};
```

#### **Opción B: Directamente en index.html (Rápido pero menos seguro)**

Abre `index.html` y busca esta línea:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=places&v=weekly" async defer></script>
```

Reemplaza `YOUR_API_KEY` con tu clave:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&callback=initMap&libraries=places&v=weekly" async defer></script>
```

### 2.2 Verificar Archivos

Asegúrate de tener estos archivos:
```
js/
├── config.js           ← Contiene tu API Key
├── config.example.js   ← Ejemplo (para GitHub)
└── modules/
    └── MapaModule.js   ← Módulo de Google Maps
```

---

## 🧪 Paso 3: Probar la Integración

### 3.1 Abrir en Navegador

```bash
# Opción 1: Abrir directamente
open index.html

# Opción 2: Usar servidor local (recomendado)
python3 -m http.server 8000
# Luego visita: http://localhost:8000
```

### 3.2 Verificar en la Consola

Abre las DevTools (F12) y verifica estos mensajes:

```
✅ ResponsiveModule initialized
✅ UIController initialized
✅ POIDataModule initialized with 3 POIs
✅ EventsModule initialized with 3 events
✅ FavoritesModule initialized with 0 favorites
✅ RoutingModule initialized
✅ Explore the City initialized successfully
📍 Google Maps API loaded           ← ¡Importante!
✅ Google Maps initialized           ← ¡Importante!
```

### 3.3 Verificar el Mapa

Deberías ver:
- ✅ Mapa de Petrer cargado
- ✅ Controles de zoom funcionando
- ✅ 3 marcadores en el mapa (POIs de ejemplo)
- ✅ Botón de geolocalización funcionando

---

## ❌ Solución de Problemas

### Error: "Google is not defined"

**Problema:** El script de Google Maps no se cargó.

**Solución:**
1. Verifica que tu API Key sea correcta
2. Verifica que las APIs estén habilitadas
3. Abre la consola y busca errores relacionados con Google Maps
4. Asegúrate de tener conexión a internet

### Error: "This page can't load Google Maps correctly"

**Problema:** API Key inválida o restricciones mal configuradas.

**Soluciones:**
1. Verifica que la API Key sea correcta (sin espacios)
2. Revisa las restricciones en Google Cloud Console
3. Asegúrate de haber habilitado todas las APIs necesarias
4. Para pruebas locales, elimina las restricciones temporalmente

### Error: "RefererNotAllowedMapError"

**Problema:** El dominio no está en la lista de referentes permitidos.

**Solución:**
1. Ve a Google Cloud Console > API Key
2. En "Restricciones de aplicación" > "Referentes HTTP"
3. Agrega: `localhost:*` y `127.0.0.1:*` para desarrollo local

### El mapa está gris o no se muestra

**Causas comunes:**
1. **CSS conflictivo:** El contenedor necesita altura definida
2. **API no habilitada:** Habilita "Maps JavaScript API"
3. **Credenciales incorrectas:** Verifica API Key

**Solución:**
Verifica que en `styles.css` el mapa tenga altura:
```css
.map-container {
    width: 100%;
    height: 100%; /* ← Importante */
    min-height: 400px;
}
```

### Los marcadores no aparecen

**Solución:**
1. Abre la consola y verifica errores
2. Comprueba que `POIDataModule` tenga datos:
```javascript
console.log(POIDataModule.getAllPOIs());
```
3. Verifica que se llame a `updateMapMarkers()`

---

## 🔒 Seguridad de la API Key

### Para Desarrollo Local
- Usa el archivo `config.js` con tu API Key
- Agrega `js/config.js` al `.gitignore` ✅ (ya incluido)

### Para Producción
1. **Variables de entorno:** Usa variables de entorno en tu servidor
2. **Backend proxy:** Haz las peticiones desde el backend
3. **Restricciones:** Configura restricciones estrictas en Google Cloud

### ⚠️ NO HACER
- ❌ Subir API Key a repositorios públicos
- ❌ Compartir capturas de pantalla con la API Key visible
- ❌ Dejar API Key sin restricciones en producción

---

## 📊 Uso de Cuota y Costos

### Cuota Gratuita de Google Maps
- **$200 USD de crédito mensual** (gratis)
- Equivale a aproximadamente **28,000 cargas de mapa** al mes
- Para proyectos pequeños/medianos es **suficiente**

### Monitorear Uso
1. Ve a Google Cloud Console
2. Menú > **APIs y Servicios > Panel**
3. Revisa las estadísticas de uso

### Configurar Alertas
1. Ve a **Facturación**
2. Configura **Alertas de presupuesto**
3. Establece límite en $200 (o menos) para evitar cargos

---

## ✅ Verificación Final

Marca cada elemento cuando funcione:

### Funcionalidad Básica
- [ ] El mapa se carga correctamente
- [ ] Se ve Petrer, España por defecto
- [ ] Los controles de zoom funcionan
- [ ] Se puede arrastrar el mapa (pan)

### Marcadores
- [ ] Se muestran 3 marcadores de POIs
- [ ] Al hacer clic en un marcador se actualiza la tarjeta POI
- [ ] Los marcadores tienen el color/icono correcto

### Geolocalización
- [ ] El botón GPS funciona
- [ ] Se obtiene la ubicación del usuario
- [ ] Se centra el mapa en la ubicación
- [ ] Aparece un marcador azul del usuario

### Filtros
- [ ] Al filtrar por categoría, los marcadores se ocultan/muestran
- [ ] La búsqueda funciona correctamente
- [ ] Los marcadores responden a los filtros

### Performance
- [ ] El mapa carga en menos de 3 segundos
- [ ] No hay errores en la consola
- [ ] El mapa es responsive (funciona en móvil)

---

## 🚀 Siguientes Pasos

Una vez que el mapa funcione:

1. **Agregar más POIs** en `POIDataModule.js`
2. **Personalizar iconos** de marcadores por categoría
3. **Integrar Places API** para búsqueda real
4. **Agregar InfoWindows** para más detalles en marcadores
5. **Implementar rutas** con Directions API

---

## 📚 Recursos Adicionales

- **Documentación oficial:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- **Ejemplos de código:** [Google Maps Samples](https://developers.google.com/maps/documentation/javascript/examples)
- **Pricing:** [Google Maps Platform Pricing](https://developers.google.com/maps/billing/gmp-billing)
- **Soporte:** [Stack Overflow - Google Maps](https://stackoverflow.com/questions/tagged/google-maps)

---

## 💬 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa la **consola del navegador** (F12)
2. Busca el error específico en Google
3. Verifica la **documentación oficial**
4. Pregunta en **Stack Overflow**

---

**Última actualización:** 24 de noviembre de 2025  
**Estado:** ✅ Listo para usar con tu API Key
