// ====================================
// POIDataModule.js
// Obtiene y procesa los datos de lugares de interés desde Google Places API
// ====================================

export const POIDataModule = (() => {
    let pois = [];
    let filteredPOIs = [];
    let currentPOI = null;
    let userLocation = null;
    let placesService = null;
    let isLoading = false;

    // Mapeo de categorías internas a tipos de Google Places
    const CATEGORY_MAPPING = {
        'historical': ['tourist_attraction', 'museum', 'church', 'castle', 'monument'],
        'restaurants': ['restaurant', 'cafe', 'bar', 'food'],
        'nature': ['natural_feature', 'campground', 'hiking_area'] // Solo naturaleza real, sin parques urbanos
    };

    // Radio de búsqueda por categoría (en metros)
    const SEARCH_RADIUS = {
        'historical': 5000,      // 5 km para lugares históricos
        'restaurants': 3000,     // 3 km para restaurantes
        'nature': 10000,         // 10 km para naturaleza (lugares más alejados)
        'default': 5000          // 5 km por defecto
    };

    /**
     * Inicializa el módulo
     */
    function init() {
        console.log('✅ POIDataModule initialized with Google Places API');
        detectUserLocation();
    }

    /**
     * Detecta la ubicación del usuario
     */
    function detectUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 User location detected:', userLocation);
                },
                (error) => {
                    console.warn('⚠️ Could not get user location, using default (Petrer):', error.message);
                    userLocation = { lat: 38.4836, lng: -0.7768 };
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000
                }
            );
        } else {
            userLocation = { lat: 38.4836, lng: -0.7768 };
        }
    }

    /**
     * Inicializa el servicio de Places
     * @param {Object} map - Instancia del mapa de Google Maps
     */
    function initPlacesService(map) {
        if (map && window.google && window.google.maps && window.google.maps.places) {
            placesService = new google.maps.places.PlacesService(map);
            console.log('✅ Google Places Service initialized');
        } else {
            console.error('❌ Google Maps Places library not loaded');
        }
    }

    /**
     * Establece manualmente la ubicación del usuario
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     */
    function setUserLocation(lat, lng) {
        userLocation = { lat, lng };
        console.log('📍 User location set:', userLocation);
    }

    /**
     * Obtiene POIs desde Google Places API
     * @param {string} category - Categoría interna ('historical', 'restaurants', 'nature', 'all')
     * @param {number} radius - Radio de búsqueda en metros (default: 5000)
     * @returns {Promise<Array>} - Promesa con los POIs
     */
    async function fetchPOIsFromGooglePlaces(category = 'all', radius = null) {
        if (!placesService) {
            console.error('❌ Places Service not initialized');
            return [];
        }

        if (!userLocation) {
            console.error('❌ User location not set');
            return [];
        }

        isLoading = true;
        
        // Si no se proporciona radio, usar el específico de la categoría
        if (radius === null) {
            radius = SEARCH_RADIUS[category] || SEARCH_RADIUS['default'];
        }
        
        console.log(`🔍 Fetching ${category} POIs from Google Places (radius: ${radius/1000}km)...`);

        try {
            const location = new google.maps.LatLng(userLocation.lat, userLocation.lng);
            
            // Si es "all", buscar todas las categorías
            if (category === 'all') {
                const allPOIs = [];
                for (const cat of Object.keys(CATEGORY_MAPPING)) {
                    const catRadius = SEARCH_RADIUS[cat] || SEARCH_RADIUS['default'];
                    const results = await searchPlacesByCategory(cat, location, catRadius);
                    allPOIs.push(...results);
                }
                pois = allPOIs;
            } else {
                pois = await searchPlacesByCategory(category, location, radius);
            }

            // Ordenar por distancia
            pois = sortByDistanceFromLocation(pois, userLocation.lat, userLocation.lng);
            filteredPOIs = [...pois];

            console.log(`✅ ${pois.length} POIs loaded from Google Places`);
            isLoading = false;
            
            return [...pois];
        } catch (error) {
            console.error('❌ Error fetching POIs from Google Places:', error);
            isLoading = false;
            return [];
        }
    }

    /**
     * Busca lugares por categoría
     * @param {string} category - Categoría interna
     * @param {Object} location - Google Maps LatLng
     * @param {number} radius - Radio en metros
     * @returns {Promise<Array>} - Array de POIs
     */
    function searchPlacesByCategory(category, location, radius) {
        return new Promise((resolve, reject) => {
            const types = CATEGORY_MAPPING[category] || [];
            const allResults = [];
            let totalSearches = types.length;
            let searchesCompleted = 0;
            
            // Palabras clave adicionales para naturaleza
            const natureKeywords = category === 'nature' 
                ? ['montaña', 'sierra', 'río', 'sendero', 'ruta', 'mirador', 'embalse', 'valle', 'barranco']
                : [];
            
            totalSearches += natureKeywords.length;

            // Si no hay tipos ni keywords, retornar vacío
            if (totalSearches === 0) {
                resolve([]);
                return;
            }

            // Función para procesar resultados completados
            const checkCompletion = () => {
                searchesCompleted++;
                if (searchesCompleted === totalSearches) {
                    // Eliminar duplicados por place_id
                    const uniquePOIs = [];
                    const seenIds = new Set();
                    
                    allResults.forEach(poi => {
                        if (!seenIds.has(poi.id)) {
                            seenIds.add(poi.id);
                            uniquePOIs.push(poi);
                        }
                    });
                    
                    console.log(`🌲 Found ${uniquePOIs.length} unique nature places (after filtering)`);
                    resolve(uniquePOIs);
                }
            };

            // Buscar cada tipo
            types.forEach(type => {
                const request = {
                    location: location,
                    radius: radius,
                    type: type
                };

                placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // Filtrar resultados según categoría
                        let filteredResults = results;
                        
                        // Para naturaleza: excluir parques urbanos pequeños
                        if (category === 'nature') {
                            filteredResults = results.filter(place => {
                                const name = place.name.toLowerCase();
                                const types = place.types || [];
                                
                                // Excluir parques urbanos, plazas, parques infantiles
                                const isUrbanPark = 
                                    types.includes('park') && 
                                    (name.includes('parque infantil') || 
                                     name.includes('plaza') ||
                                     name.includes('jardín') ||
                                     name.includes('jardin') ||
                                     name.includes('parque municipal'));
                                
                                // Excluir restaurantes que puedan aparecer
                                const isRestaurant = 
                                    types.includes('restaurant') || 
                                    types.includes('cafe') || 
                                    types.includes('bar') ||
                                    types.includes('food');
                                
                                // Solo incluir lugares naturales reales
                                return !isUrbanPark && !isRestaurant;
                            });
                        }
                        
                        const processedResults = filteredResults.map(place => 
                            processGooglePlace(place, category)
                        );
                        allResults.push(...processedResults);
                    }

                    checkCompletion();
                });
            });
            
            // Búsquedas adicionales por palabras clave para naturaleza
            natureKeywords.forEach(keyword => {
                const request = {
                    location: location,
                    radius: radius,
                    query: keyword
                };

                placesService.textSearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // Filtrar para excluir restaurantes y lugares urbanos
                        const filteredResults = results.filter(place => {
                            const name = place.name.toLowerCase();
                            const types = place.types || [];
                            
                            // Excluir restaurantes
                            const isRestaurant = 
                                types.includes('restaurant') || 
                                types.includes('cafe') || 
                                types.includes('bar') ||
                                types.includes('food') ||
                                name.includes('restaurante') ||
                                name.includes('bar') ||
                                name.includes('cafetería');
                            
                            // Excluir parques urbanos
                            const isUrbanPark = 
                                name.includes('plaza') ||
                                name.includes('parque infantil') ||
                                name.includes('jardín municipal');
                            
                            return !isRestaurant && !isUrbanPark;
                        });
                        
                        const processedResults = filteredResults.map(place => 
                            processGooglePlace(place, category)
                        );
                        allResults.push(...processedResults);
                    }

                    checkCompletion();
                });
            });
        });
    }

    /**
     * Procesa un lugar de Google Places a formato interno
     * @param {Object} place - Lugar de Google Places
     * @param {string} category - Categoría interna
     * @returns {Object} - POI en formato interno
     */
    function processGooglePlace(place, category) {
        // Calcular distancia
        let distance = null;
        if (userLocation && place.geometry && place.geometry.location) {
            distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );
        }

        // Obtener URL de foto si existe
        let photoUrl = null;
        if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
        }

        return {
            id: place.place_id,
            name: place.name,
            description: place.types ? place.types[0].replace(/_/g, ' ') : category,
            category: category,
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            address: place.vicinity || place.formatted_address || 'Address not available',
            distance: distance,
            isOpen: place.opening_hours ? place.opening_hours.open_now : null,
            priceLevel: place.price_level || null,
            photo: photoUrl,
            photos: place.photos || [],
            source: 'google_places',
            rawData: place
        };
    }

    /**
     * Calcula la distancia entre dos puntos en km
     */
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
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
     * Ordena POIs por distancia
     */
    function sortByDistanceFromLocation(poisArray, lat, lng) {
        return poisArray.map(poi => {
            if (!poi.distance) {
                poi.distance = calculateDistance(
                    lat, lng,
                    poi.coordinates.lat,
                    poi.coordinates.lng
                );
            }
            return poi;
        }).sort((a, b) => a.distance - b.distance);
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
     * Filtra POIs por categoría (localmente, de los ya cargados)
     * @param {string} category - Categoría a filtrar
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
        filteredPOIs = sortByDistanceFromLocation(filteredPOIs, userLat, userLng);
        return [...filteredPOIs];
    }

    /**
     * Establece el POI actual
     * @param {Object} poi - POI a establecer como actual
     */
    function setCurrentPOI(poi) {
        currentPOI = poi;
        console.log('Current POI set:', poi ? poi.name : 'null');
    }

    /**
     * Obtiene el POI actual
     * @returns {Object|null} - POI actual o null
     */
    function getCurrentPOI() {
        return currentPOI;
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
            const distance = poi.distance || calculateDistance(
                lat, lng,
                poi.coordinates.lat,
                poi.coordinates.lng
            );
            return distance <= radiusKm;
        });

        console.log(`Found ${nearby.length} POIs within ${radiusKm}km`);
        return nearby;
    }

    /**
     * Formatea la distancia para mostrar
     * @param {number} distanceKm - Distancia en kilómetros
     * @returns {string} - Distancia formateada
     */
    function formatDistance(distanceKm) {
        if (!distanceKm) return 'N/A';
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)} m`;
        }
        return `${distanceKm.toFixed(1)} km`;
    }

    /**
     * Formatea el precio
     * @param {number} priceLevel - Nivel de precio (0-4)
     * @returns {string} - Precio formateado
     */
    function formatPriceLevel(priceLevel) {
        if (priceLevel === null || priceLevel === undefined) return 'N/A';
        return '€'.repeat(priceLevel);
    }

    /**
     * Verifica si el módulo está cargando
     * @returns {boolean} - true si está cargando
     */
    function getLoadingState() {
        return isLoading;
    }

    /**
     * Obtiene la ubicación del usuario
     * @returns {Object|null} - Ubicación del usuario
     */
    function getUserLocation() {
        return userLocation;
    }

    // API pública del módulo
    return {
        init,
        initPlacesService,
        setUserLocation,
        fetchPOIsFromGooglePlaces,
        getAllPOIs,
        getFilteredPOIs,
        getPOIById,
        filterByCategory,
        searchPOIs,
        sortByDistance,
        setCurrentPOI,
        getCurrentPOI,
        getNearbyPOIs,
        formatDistance,
        formatPriceLevel,
        getLoadingState,
        getUserLocation
    };
})();

