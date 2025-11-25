// ====================================
// Config.js - Configuración de Google Maps
// ====================================

const GOOGLE_MAPS_CONFIG = {
    // ⚠️ Reemplaza 'YOUR_API_KEY' con tu Google Maps API Key real
    apiKey: 'AIzaSyBIn1rh17eNN0fQuMYHEoqQh2shL6vdxIU',
    
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
