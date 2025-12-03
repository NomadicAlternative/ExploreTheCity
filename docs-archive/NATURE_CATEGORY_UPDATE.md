# Actualización Categoría "Nature" - Lugares Naturales Reales

## 📋 Resumen de Cambios
Se ha actualizado la categoría **"Nature"** para mostrar lugares naturales reales (montañas, ríos, senderos) en un radio de 10 km, excluyendo parques urbanos y restaurantes.

## 🎯 Objetivo
Cuando el usuario selecciona el filtro "Nature", debe ver lugares de naturaleza auténticos como:
- 🏔️ Montañas y sierras
- 🌊 Ríos y embalses
- 🥾 Senderos y rutas de senderismo
- 🌄 Miradores naturales
- 🏞️ Valles y barrancos
- 🏕️ Zonas de camping y acampada

**NO** debe incluir:
- ❌ Parques urbanos pequeños
- ❌ Plazas de la ciudad
- ❌ Parques infantiles
- ❌ Jardines municipales
- ❌ Restaurantes

## 🔧 Cambios Técnicos

### 1. **Mapeo de Tipos de Google Places** (`CATEGORY_MAPPING`)

**ANTES:**
```javascript
'nature': ['park', 'natural_feature', 'campground', 'hiking_area']
```

**DESPUÉS:**
```javascript
'nature': ['natural_feature', 'campground', 'hiking_area']
// Se removió 'park' para evitar parques urbanos
```

### 2. **Radio de Búsqueda por Categoría** (`SEARCH_RADIUS`)

Se añadió un objeto con radios específicos por categoría:

```javascript
const SEARCH_RADIUS = {
    'historical': 5000,      // 5 km para lugares históricos
    'restaurants': 3000,     // 3 km para restaurantes
    'nature': 10000,         // 10 km para naturaleza ⭐ AMPLIADO
    'default': 5000          // 5 km por defecto
};
```

**Razón**: Los lugares naturales suelen estar más alejados de las zonas urbanas.

### 3. **Búsquedas por Palabras Clave**

Se añadieron búsquedas adicionales con palabras clave específicas en español:

```javascript
const natureKeywords = [
    'montaña',
    'sierra',
    'río',
    'sendero',
    'ruta',
    'mirador',
    'embalse',
    'valle',
    'barranco'
];
```

**Método**: Se usa `textSearch` de Google Places API además de `nearbySearch` para encontrar más lugares naturales.

### 4. **Filtros Inteligentes**

Se implementaron filtros para excluir lugares no deseados:

#### Filtro 1: Excluir Parques Urbanos
```javascript
const isUrbanPark = 
    types.includes('park') && 
    (name.includes('parque infantil') || 
     name.includes('plaza') ||
     name.includes('jardín') ||
     name.includes('jardin') ||
     name.includes('parque municipal'));
```

#### Filtro 2: Excluir Restaurantes
```javascript
const isRestaurant = 
    types.includes('restaurant') || 
    types.includes('cafe') || 
    types.includes('bar') ||
    types.includes('food') ||
    name.includes('restaurante') ||
    name.includes('bar') ||
    name.includes('cafetería');
```

#### Filtro 3: Excluir en Búsqueda por Keywords
```javascript
const isUrbanPark = 
    name.includes('plaza') ||
    name.includes('parque infantil') ||
    name.includes('jardín municipal');
```

### 5. **Función `fetchPOIsFromGooglePlaces` Actualizada**

Ahora usa el radio específico de cada categoría automáticamente:

```javascript
async function fetchPOIsFromGooglePlaces(category = 'all', radius = null) {
    // Si no se proporciona radio, usar el específico de la categoría
    if (radius === null) {
        radius = SEARCH_RADIUS[category] || SEARCH_RADIUS['default'];
    }
    
    console.log(`🔍 Fetching ${category} POIs (radius: ${radius/1000}km)...`);
    
    // Si es "all", usar radio específico por categoría
    if (category === 'all') {
        for (const cat of Object.keys(CATEGORY_MAPPING)) {
            const catRadius = SEARCH_RADIUS[cat] || SEARCH_RADIUS['default'];
            const results = await searchPlacesByCategory(cat, location, catRadius);
            allPOIs.push(...results);
        }
    }
}
```

### 6. **Función `searchPlacesByCategory` Mejorada**

#### Cambios principales:
1. **Búsquedas múltiples**: nearbySearch (por tipo) + textSearch (por keywords)
2. **Contador dinámico**: Espera a que todas las búsquedas terminen
3. **Filtrado avanzado**: Aplica filtros específicos según categoría
4. **Deduplicación**: Elimina lugares duplicados por `place_id`

```javascript
function searchPlacesByCategory(category, location, radius) {
    return new Promise((resolve, reject) => {
        const types = CATEGORY_MAPPING[category] || [];
        const allResults = [];
        let totalSearches = types.length;
        let searchesCompleted = 0;
        
        // Añadir búsquedas por keywords si es naturaleza
        const natureKeywords = category === 'nature' ? [...] : [];
        totalSearches += natureKeywords.length;
        
        const checkCompletion = () => {
            searchesCompleted++;
            if (searchesCompleted === totalSearches) {
                // Eliminar duplicados y resolver
                resolve(uniquePOIs);
            }
        };
        
        // 1. Buscar por tipos (nearbySearch)
        types.forEach(type => { ... });
        
        // 2. Buscar por keywords (textSearch) - solo para nature
        natureKeywords.forEach(keyword => { ... });
    });
}
```

## 📊 Flujo de Búsqueda para "Nature"

```
Usuario click "Nature"
    ↓
fetchPOIsFromGooglePlaces('nature', null)
    ↓
Radio automático: 10,000 metros (10 km)
    ↓
searchPlacesByCategory('nature', location, 10000)
    ↓
┌─────────────────────────────────────────┐
│  BÚSQUEDAS PARALELAS (12 total):       │
├─────────────────────────────────────────┤
│  nearbySearch:                          │
│    1. type: 'natural_feature'           │
│    2. type: 'campground'                │
│    3. type: 'hiking_area'               │
│                                         │
│  textSearch:                            │
│    4. query: 'montaña'                  │
│    5. query: 'sierra'                   │
│    6. query: 'río'                      │
│    7. query: 'sendero'                  │
│    8. query: 'ruta'                     │
│    9. query: 'mirador'                  │
│   10. query: 'embalse'                  │
│   11. query: 'valle'                    │
│   12. query: 'barranco'                 │
└─────────────────────────────────────────┘
    ↓
Filtrar cada resultado:
  - ❌ ¿Es parque urbano? → Excluir
  - ❌ ¿Es restaurante? → Excluir
  - ❌ ¿Es plaza? → Excluir
  - ✅ ¿Es lugar natural? → Incluir
    ↓
Eliminar duplicados por place_id
    ↓
Ordenar por distancia
    ↓
Mostrar tarjetas en lista scrollable
```

## 🧪 Ejemplos de Resultados Esperados

### ✅ INCLUIR (Ejemplos reales cerca de Petrer/Elda):
- Sierra del Maigmó
- Barranco del Reconco
- Ruta de la Font Roja
- Sierra de la Villa
- Embalse de Elda
- Sendero PR-CV 42
- Mirador del Castillo
- Parque Natural de la Sierra Mariola
- Río Vinalopó
- Ruta de los Molinos

### ❌ EXCLUIR:
- Parque Infantil Municipal
- Plaza de España
- Jardín Botánico Municipal
- Parque de los Molinos (si es urbano pequeño)
- Restaurante La Montaña
- Bar El Río
- Cafetería El Sendero

## 🎨 Experiencia de Usuario

### Antes del cambio:
```
Nature → [Resultados mezclados]
- Parque infantil (500m)
- Plaza del pueblo (800m)
- Montaña Sierra (12km - no aparecía por radio 5km)
- Restaurante El Campo (2km)
```

### Después del cambio:
```
Nature → [Solo lugares naturales reales, radio 10km]
- Sierra del Maigmó (8.5km) 🏔️
- Sendero PR-CV 42 (6.2km) 🥾
- Barranco del Reconco (7.8km) 🏞️
- Embalse de Elda (9.1km) 🌊
- Mirador Natural (5.4km) 🌄
```

## 🔍 Logs de Depuración

En la consola del navegador verás:
```
🔍 Fetching nature POIs from Google Places (radius: 10km)...
🌲 Found 15 unique nature places (after filtering)
✅ 15 POIs loaded from Google Places
```

## 📝 Notas Técnicas

### Límites de Google Places API:
- **nearbySearch**: Máximo 60 resultados por búsqueda (20 por página)
- **textSearch**: Máximo 60 resultados por búsqueda
- **Cuota diaria**: Depende del plan (gratuito: ~28,500 requests/mes)

### Optimizaciones:
- Se deduplicán resultados por `place_id`
- Solo se procesan resultados con status OK
- Se filtran antes de procesar para reducir carga
- Los resultados se cachean en memoria (variable `pois`)

### Consideraciones:
- La calidad de resultados depende de los datos de Google Maps en la zona
- Algunas zonas rurales pueden tener menos datos
- Los nombres de lugares pueden variar (en español/valenciano)
- Se recomienda probar en diferentes ubicaciones

## ✅ Verificación

Para probar que funciona correctamente:

1. **Abrir la aplicación** y permitir geolocalización
2. **Click en filtro "Nature"**
3. **Verificar en consola**:
   - Radio de búsqueda: 10 km
   - Número de búsquedas realizadas
   - Cantidad de resultados encontrados
4. **Revisar tarjetas mostradas**:
   - Solo lugares naturales reales
   - Sin parques urbanos
   - Sin restaurantes
   - Ordenados por distancia
5. **Verificar distancias**: Deben llegar hasta 10 km

## 🐛 Troubleshooting

### Problema: No aparecen resultados
**Solución**: 
- Verificar que la geolocalización funciona
- Revisar consola para errores de API
- Aumentar el radio si la zona es muy rural

### Problema: Aparecen parques urbanos
**Solución**:
- Añadir más palabras clave al filtro `isUrbanPark`
- Verificar nombres en español y valenciano

### Problema: Aparecen restaurantes
**Solución**:
- Verificar que el filtro `isRestaurant` incluya todos los tipos
- Añadir más palabras clave al filtro de nombres

---

**Fecha de actualización**: 26 de noviembre de 2025
**Versión**: 2.0
**Radio de búsqueda**: 10 km
**Tipos de búsqueda**: nearbySearch + textSearch
**Total búsquedas**: 12 (3 types + 9 keywords)
