// ====================================
// MapaModule.js
// Inicializa Google Maps, marcadores y eventos de clic
// ====================================

export const MapaModule = (() => {
    let map = null;
    let userMarker = null;
    let poiMarkers = [];
    let currentLocation = null;

    /**
     * Inicializa el mapa de Google Maps
     * @param {string} containerId - ID del contenedor del mapa
     * @param {Object} options - Opciones de configuración del mapa
     */
    function initMap(containerId, options = {}) {
        // Obtener configuración global
        const config = window.GOOGLE_MAPS_CONFIG || {};
        
        const defaultOptions = {
            center: config.defaultCenter || { lat: 38.4836, lng: -0.7768 },
            zoom: config.defaultZoom || 14,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: getMapStyles(),
            ...config.mapOptions
        };

        const mapOptions = { ...defaultOptions, ...options };
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container with ID "${containerId}" not found`);
            return null;
        }

        try {
            map = new google.maps.Map(container, mapOptions);
            console.log('✅ Google Maps initialized successfully');
            return map;
        } catch (error) {
            console.error('❌ Error initializing Google Maps:', error);
            return null;
        }
    }

    /**
     * Estilos personalizados del mapa
     */
    function getMapStyles() {
        return [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ];
    }

    /**
     * Centra el mapa en una ubicación específica
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @param {number} zoom - Nivel de zoom (opcional)
     */
    function centerMap(lat, lng, zoom = null) {
        if (!map) {
            console.error('Map not initialized');
            return;
        }

        map.setCenter({ lat, lng });
        if (zoom) {
            map.setZoom(zoom);
        }
    }

    /**
     * Agrega un marcador en el mapa
     * @param {Object} options - Opciones del marcador
     * @returns {Object} - Objeto del marcador
     */
    function addMarker(options) {
        if (!map) {
            console.error('Map not initialized');
            return null;
        }

        const markerOptions = {
            map,
            position: options.position,
            title: options.title || '',
            icon: options.icon || null,
            animation: options.animation || null
        };

        const marker = new google.maps.Marker(markerOptions);

        // Agregar evento de clic si se proporciona
        if (options.onClick) {
            marker.addListener('click', () => {
                options.onClick(marker, options.data);
            });
        }

        poiMarkers.push(marker);
        return marker;
    }

    /**
     * Agrega el marcador de ubicación del usuario
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     */
    function addUserMarker(lat, lng) {
        if (!map) {
            console.error('Map not initialized');
            return null;
        }

        // Remover marcador anterior si existe
        if (userMarker) {
            userMarker.setMap(null);
        }

        userMarker = new google.maps.Marker({
            map,
            position: { lat, lng },
            title: 'Your location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            animation: google.maps.Animation.DROP
        });

        currentLocation = { lat, lng };
        centerMap(lat, lng, 15);

        return userMarker;
    }

    /**
     * Limpia todos los marcadores del mapa
     */
    function clearMarkers() {
        poiMarkers.forEach(marker => marker.setMap(null));
        poiMarkers = [];
    }

    /**
     * Muestra u oculta marcadores según categoría
     * @param {string} category - Categoría a filtrar
     */
    function filterMarkersByCategory(category) {
        poiMarkers.forEach(marker => {
            const markerCategory = marker.get('category');
            if (category === 'all' || markerCategory === category) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
    }

    /**
     * Obtiene la ubicación actual del usuario
     * @param {Function} onSuccess - Callback cuando se obtiene la ubicación
     * @param {Function} onError - Callback cuando hay error
     */
    function getUserLocation(onSuccess, onError) {
        if (!('geolocation' in navigator)) {
            console.error('Geolocation not supported');
            if (onError) onError(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                currentLocation = { lat: latitude, lng: longitude };
                
                if (onSuccess) {
                    onSuccess(latitude, longitude);
                }
            },
            (error) => {
                console.error('Error getting user location:', error);
                if (onError) onError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }

    /**
     * Calcula la distancia entre dos puntos (en km)
     * @param {number} lat1 - Latitud del punto 1
     * @param {number} lng1 - Longitud del punto 1
     * @param {number} lat2 - Latitud del punto 2
     * @param {number} lng2 - Longitud del punto 2
     * @returns {number} - Distancia en kilómetros
     */
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Obtiene la ubicación actual guardada
     * @returns {Object|null} - Objeto con lat y lng
     */
    function getCurrentLocation() {
        return currentLocation;
    }

    /**
     * Obtiene el objeto del mapa
     * @returns {Object|null} - Objeto de Google Maps
     */
    function getMap() {
        return map;
    }

    // API pública del módulo
    return {
        initMap,
        centerMap,
        addMarker,
        addUserMarker,
        clearMarkers,
        filterMarkersByCategory,
        getUserLocation,
        calculateDistance,
        getCurrentLocation,
        getMap
    };
})();

// Exportar globalmente para el callback de Google Maps
window.MapaModule = MapaModule;
