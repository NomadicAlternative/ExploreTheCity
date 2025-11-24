// ====================================
// Config.example.js - Ejemplo de configuración
// ====================================

/**
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a "config.js"
 * 2. Reemplaza 'YOUR_API_KEY' con tu Google Maps API Key real
 * 3. Ajusta las configuraciones según tus necesidades
 */

const GOOGLE_MAPS_CONFIG = {
    // ⚠️ Reemplaza con tu API Key de Google Maps
    apiKey: 'YOUR_API_KEY',
    
    // Ubicación por defecto: Petrer, España
    defaultCenter: {
        lat: 38.4836,
        lng: -0.7768
    },
    
    // Zoom por defecto
    defaultZoom: 14,
    
    // Configuración del mapa
    mapOptions: {
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
    },
    
    // Bibliotecas adicionales de Google Maps
    libraries: ['places', 'geometry']
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GOOGLE_MAPS_CONFIG;
}

window.GOOGLE_MAPS_CONFIG = GOOGLE_MAPS_CONFIG;
