// ====================================
// POIDataModule.js
// Obtiene y procesa los datos de lugares de interés
// ====================================

export const POIDataModule = (() => {
    let pois = [];
    let filteredPOIs = [];
    let currentPOI = null;

    // Datos temporales de POIs (serán reemplazados por Google Places API)
    const samplePOIs = [
        {
            id: 'poi-1',
            name: 'Castillo de Petrer',
            description: 'Castillo medieval con vistas panorámicas de la ciudad',
            category: 'historical',
            rating: 4.5,
            coordinates: { lat: 38.4845, lng: -0.7765 },
            address: 'Calle Castillo, s/n, Petrer',
            phone: '+34 965 950 102',
            hours: 'Lun-Dom: 10:00 - 18:00',
            images: ['images/castle.jpg'],
            website: 'https://www.petrer.es'
        },
        {
            id: 'poi-2',
            name: 'Restaurante El Molino',
            description: 'Cocina tradicional española con ingredientes locales',
            category: 'restaurants',
            rating: 4.3,
            coordinates: { lat: 38.4830, lng: -0.7780 },
            address: 'Calle Mayor, 15, Petrer',
            phone: '+34 965 123 456',
            hours: 'Mar-Dom: 13:00 - 16:00, 20:00 - 23:00',
            images: ['images/restaurant.jpg'],
            website: null
        },
        {
            id: 'poi-3',
            name: 'Serra del Cid',
            description: 'Ruta de senderismo con impresionantes vistas naturales',
            category: 'nature',
            rating: 4.7,
            coordinates: { lat: 38.4900, lng: -0.7700 },
            address: 'Acceso desde Petrer',
            phone: null,
            hours: 'Siempre abierto',
            images: ['images/mountain.jpg'],
            website: null
        }
    ];

    /**
     * Inicializa el módulo con datos
     */
    function init() {
        pois = [...samplePOIs];
        filteredPOIs = [...pois];
        console.log('✅ POIDataModule initialized with', pois.length, 'POIs');
    }

    /**
     * Obtiene todos los POIs
     * @returns {Array} - Array de POIs
     */
    function getAllPOIs() {
        return [...pois];
    }

    /**
     * Obtiene los POIs filtrados
     * @returns {Array} - Array de POIs filtrados
     */
    function getFilteredPOIs() {
        return [...filteredPOIs];
    }

    /**
     * Obtiene un POI por su ID
     * @param {string} id - ID del POI
     * @returns {Object|null} - POI encontrado o null
     */
    function getPOIById(id) {
        return pois.find(poi => poi.id === id) || null;
    }

    /**
     * Filtra POIs por categoría
     * @param {string} category - Categoría a filtrar ('all', 'historical', 'restaurants', 'nature', 'events')
     * @returns {Array} - POIs filtrados
     */
    function filterByCategory(category) {
        if (category === 'all') {
            filteredPOIs = [...pois];
        } else {
            filteredPOIs = pois.filter(poi => poi.category === category);
        }
        
        console.log(`Filtered POIs by category "${category}":`, filteredPOIs.length);
        return [...filteredPOIs];
    }

    /**
     * Filtra POIs por múltiples categorías
     * @param {Array} categories - Array de categorías
     * @returns {Array} - POIs filtrados
     */
    function filterByCategories(categories) {
        if (categories.length === 0) {
            filteredPOIs = [];
        } else {
            filteredPOIs = pois.filter(poi => categories.includes(poi.category));
        }
        
        console.log(`Filtered POIs by categories [${categories.join(', ')}]:`, filteredPOIs.length);
        return [...filteredPOIs];
    }

    /**
     * Busca POIs por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} - POIs que coinciden con la búsqueda
     */
    function searchPOIs(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term.length === 0) {
            filteredPOIs = [...pois];
            return filteredPOIs;
        }

        filteredPOIs = pois.filter(poi => {
            return poi.name.toLowerCase().includes(term) ||
                   poi.description.toLowerCase().includes(term) ||
                   poi.category.toLowerCase().includes(term) ||
                   poi.address.toLowerCase().includes(term);
        });

        console.log(`Search results for "${searchTerm}":`, filteredPOIs.length);
        return [...filteredPOIs];
    }

    /**
     * Ordena POIs por distancia desde una ubicación
     * @param {number} userLat - Latitud del usuario
     * @param {number} userLng - Longitud del usuario
     * @returns {Array} - POIs ordenados por distancia
     */
    function sortByDistance(userLat, userLng) {
        // Importar la función de cálculo de distancia de MapaModule
        // Por ahora, usamos una implementación simple
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLng = (lng2 - lng1) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        filteredPOIs = filteredPOIs.map(poi => ({
            ...poi,
            distance: calculateDistance(
                userLat,
                userLng,
                poi.coordinates.lat,
                poi.coordinates.lng
            )
        })).sort((a, b) => a.distance - b.distance);

        return [...filteredPOIs];
    }

    /**
     * Establece el POI actual
     * @param {Object} poi - POI a establecer como actual
     */
    function setCurrentPOI(poi) {
        currentPOI = poi;
        console.log('Current POI set:', poi.name);
    }

    /**
     * Obtiene el POI actual
     * @returns {Object|null} - POI actual o null
     */
    function getCurrentPOI() {
        return currentPOI;
    }

    /**
     * Agrega un nuevo POI
     * @param {Object} poi - Datos del POI
     * @returns {Object} - POI agregado
     */
    function addPOI(poi) {
        const newPOI = {
            id: `poi-${Date.now()}`,
            ...poi,
            rating: poi.rating || 0,
            images: poi.images || []
        };

        pois.push(newPOI);
        filteredPOIs.push(newPOI);
        
        console.log('POI added:', newPOI.name);
        return newPOI;
    }

    /**
     * Actualiza un POI existente
     * @param {string} id - ID del POI
     * @param {Object} updates - Datos a actualizar
     * @returns {Object|null} - POI actualizado o null
     */
    function updatePOI(id, updates) {
        const index = pois.findIndex(poi => poi.id === id);
        
        if (index === -1) {
            console.error('POI not found:', id);
            return null;
        }

        pois[index] = { ...pois[index], ...updates };
        
        // Actualizar también en filteredPOIs si existe
        const filteredIndex = filteredPOIs.findIndex(poi => poi.id === id);
        if (filteredIndex !== -1) {
            filteredPOIs[filteredIndex] = { ...pois[index] };
        }

        console.log('POI updated:', pois[index].name);
        return pois[index];
    }

    /**
     * Obtiene POIs cercanos a una ubicación
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @param {number} radiusKm - Radio en kilómetros
     * @returns {Array} - POIs cercanos
     */
    function getNearbyPOIs(lat, lng, radiusKm = 5) {
        const nearby = pois.filter(poi => {
            const distance = calculateSimpleDistance(
                lat,
                lng,
                poi.coordinates.lat,
                poi.coordinates.lng
            );
            return distance <= radiusKm;
        });

        console.log(`Found ${nearby.length} POIs within ${radiusKm}km`);
        return nearby;
    }

    function calculateSimpleDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Formatea la distancia para mostrar
     * @param {number} distanceKm - Distancia en kilómetros
     * @returns {string} - Distancia formateada
     */
    function formatDistance(distanceKm) {
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)} m`;
        }
        return `${distanceKm.toFixed(1)} km`;
    }

    // API pública del módulo
    return {
        init,
        getAllPOIs,
        getFilteredPOIs,
        getPOIById,
        filterByCategory,
        filterByCategories,
        searchPOIs,
        sortByDistance,
        setCurrentPOI,
        getCurrentPOI,
        addPOI,
        updatePOI,
        getNearbyPOIs,
        formatDistance
    };
})();
