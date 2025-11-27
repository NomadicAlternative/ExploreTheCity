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
        'historical': 10000,     // 10 km para lugares históricos (como Google Maps)
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
        // Para NATURE: usar búsqueda de texto principal
        if (category === 'nature') {
            return searchNaturePlaces(location, radius);
        }
        
        // Para HISTORICAL: usar búsqueda de texto como Google Maps
        if (category === 'historical') {
            return searchHistoricalPlaces(location, radius);
        }
        
        // Para otras categorías: búsqueda normal por tipos
        return new Promise((resolve, reject) => {
            const types = CATEGORY_MAPPING[category] || [];
            const allResults = [];
            let totalSearches = types.length;
            let searchesCompleted = 0;

            // Si no hay tipos, retornar vacío
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
                        const processedResults = results.map(place => 
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
     * Búsqueda especializada para lugares de naturaleza
     * Usa Text Search con query en español para mejores resultados
     * @param {Object} location - Google Maps LatLng
     * @param {number} radius - Radio en metros
     * @returns {Promise<Array>} - Array de POIs
     */
    function searchNaturePlaces(location, radius) {
        return new Promise((resolve, reject) => {
            console.log('🌳 Searching nature places with text query...');
            
            // Query principal en español
            const request = {
                location: location,
                radius: radius,
                query: 'lugares de naturaleza cerca de mi'
            };

            placesService.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    console.log(`🌲 Found ${results.length} raw nature results`);
                    
                    // Filtrar para excluir lugares urbanos/no naturales
                    const filteredResults = results.filter(place => {
                        const name = place.name.toLowerCase();
                        const types = place.types || [];
                        
                        // Palabras clave de lugares NO naturales (excluir)
                        const urbanKeywords = [
                            'hotel', 'restaurante', 'restaurant', 'cafe', 'bar',
                            'tienda', 'shop', 'store', 'centro comercial', 'mall',
                            'parking', 'aparcamiento', 'gasolinera', 'gas station',
                            'hospital', 'farmacia', 'pharmacy', 'supermercado',
                            'iglesia', 'church', 'ayuntamiento', 'city hall'
                        ];
                        
                        // Verificar si contiene keywords urbanas
                        const hasUrbanKeyword = urbanKeywords.some(keyword => 
                            name.includes(keyword)
                        );
                        
                        // Verificar tipos urbanos
                        const urbanTypes = [
                            'restaurant', 'cafe', 'bar', 'food', 'lodging',
                            'store', 'shopping_mall', 'gas_station', 'hospital',
                            'pharmacy', 'church', 'mosque', 'synagogue'
                        ];
                        
                        const hasUrbanType = types.some(type => 
                            urbanTypes.includes(type)
                        );
                        
                        // Palabras clave POSITIVAS de naturaleza
                        const natureKeywords = [
                            'parque natural', 'natural park', 'sierra', 'montaña', 
                            'mountain', 'río', 'river', 'embalse', 'reservoir', 
                            'sendero', 'trail', 'ruta', 'route', 'mirador', 
                            'viewpoint', 'valle', 'valley', 'bosque', 'forest',
                            'barranco', 'canyon', 'cueva', 'cave', 'cascada',
                            'waterfall', 'laguna', 'lake', 'playa', 'beach',
                            'costa', 'coast', 'acantilado', 'cliff', 'zona verde',
                            'área recreativa', 'recreational area', 'pinar',
                            'pine forest', 'ermita', 'chapel'
                        ];
                        
                        const hasNatureKeyword = natureKeywords.some(keyword =>
                            name.includes(keyword)
                        );
                        
                        // Tipos POSITIVOS de naturaleza
                        const natureTypes = [
                            'natural_feature', 'park', 'campground', 'hiking_area',
                            'point_of_interest', 'tourist_attraction'
                        ];
                        
                        const hasNatureType = types.some(type =>
                            natureTypes.includes(type)
                        );
                        
                        // INCLUIR si:
                        // - Tiene keyword de naturaleza O tiene tipo de naturaleza
                        // - Y NO tiene keywords urbanas ni tipos urbanos
                        const isNaturalPlace = (hasNatureKeyword || hasNatureType) && 
                                              !hasUrbanKeyword && 
                                              !hasUrbanType;
                        
                        return isNaturalPlace;
                    });
                    
                    console.log(`✅ Filtered to ${filteredResults.length} natural places`);
                    
                    // Procesar resultados
                    const processedResults = filteredResults.map(place => 
                        processGooglePlace(place, 'nature')
                    );
                    
                    // Eliminar duplicados
                    const uniquePOIs = [];
                    const seenIds = new Set();
                    
                    processedResults.forEach(poi => {
                        if (!seenIds.has(poi.id)) {
                            seenIds.add(poi.id);
                            uniquePOIs.push(poi);
                        }
                    });
                    
                    resolve(uniquePOIs);
                } else {
                    console.warn('⚠️ Nature text search failed:', status);
                    // Fallback a búsqueda normal
                    searchNaturePlacesFallback(location, radius)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Búsqueda especializada para sitios históricos
     * Usa Text Search con query "sitios históricos cerca de mí" como Google Maps
     * @param {Object} location - Google Maps LatLng
     * @param {number} radius - Radio en metros
     * @returns {Promise<Array>} - Array de POIs
     */
    function searchHistoricalPlaces(location, radius) {
        return new Promise((resolve, reject) => {
            console.log('🏛️ Searching historical places with text query...');
            
            // Query principal en español (igual que Google Maps)
            const request = {
                location: location,
                radius: radius,
                query: 'sitios históricos cerca de mí'
            };

            placesService.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    console.log(`🏛️ Found ${results.length} historical places`);
                    
                    // Filtrar para asegurar que son lugares históricos relevantes
                    const filteredResults = results.filter(place => {
                        const name = place.name.toLowerCase();
                        const types = place.types || [];
                        
                        // Palabras clave de lugares NO históricos (excluir)
                        const nonHistoricalKeywords = [
                            'hotel', 'restaurante', 'restaurant', 'cafe', 'bar',
                            'tienda', 'shop', 'store', 'centro comercial', 'mall',
                            'parking', 'aparcamiento', 'gasolinera', 'gas station',
                            'hospital', 'farmacia', 'pharmacy', 'supermercado',
                            'supermercado', 'banco', 'bank'
                        ];
                        
                        // Verificar si contiene keywords no históricos
                        const hasNonHistoricalKeyword = nonHistoricalKeywords.some(keyword => 
                            name.includes(keyword)
                        );
                        
                        // Tipos no históricos
                        const nonHistoricalTypes = [
                            'restaurant', 'cafe', 'bar', 'food', 'lodging',
                            'store', 'shopping_mall', 'gas_station', 'hospital',
                            'pharmacy', 'bank', 'atm'
                        ];
                        
                        const hasNonHistoricalType = types.some(type => 
                            nonHistoricalTypes.includes(type)
                        );
                        
                        // Palabras clave POSITIVAS de lugares históricos
                        const historicalKeywords = [
                            'castillo', 'castle', 'museo', 'museum', 'iglesia', 
                            'church', 'catedral', 'cathedral', 'monasterio', 
                            'monastery', 'ermita', 'chapel', 'palacio', 'palace',
                            'fortaleza', 'fortress', 'muralla', 'wall', 'torre',
                            'tower', 'templo', 'temple', 'basílica', 'basilica',
                            'convento', 'convent', 'ruinas', 'ruins', 'histórico',
                            'historical', 'antiguo', 'ancient', 'monumento',
                            'monument', 'patrimonio', 'heritage', 'arqueológico',
                            'archaeological', 'medieval', 'romano', 'roman',
                            'árabe', 'arab', 'mezquita', 'mosque', 'sinagoga',
                            'synagogue', 'puente', 'bridge', 'acueducto', 'aqueduct'
                        ];
                        
                        const hasHistoricalKeyword = historicalKeywords.some(keyword =>
                            name.includes(keyword)
                        );
                        
                        // Tipos POSITIVOS de lugares históricos
                        const historicalTypes = [
                            'tourist_attraction', 'museum', 'church', 'place_of_worship',
                            'point_of_interest', 'establishment', 'castle', 'monument'
                        ];
                        
                        const hasHistoricalType = types.some(type =>
                            historicalTypes.includes(type)
                        );
                        
                        // INCLUIR si:
                        // - Tiene keyword histórica O tiene tipo histórico
                        // - Y NO tiene keywords ni tipos no históricos
                        const isHistoricalPlace = (hasHistoricalKeyword || hasHistoricalType) && 
                                                 !hasNonHistoricalKeyword && 
                                                 !hasNonHistoricalType;
                        
                        return isHistoricalPlace;
                    });
                    
                    console.log(`✅ Filtered to ${filteredResults.length} historical places`);
                    
                    // Procesar resultados
                    const processedResults = filteredResults.map(place => 
                        processGooglePlace(place, 'historical')
                    );
                    
                    // Eliminar duplicados
                    const uniquePOIs = [];
                    const seenIds = new Set();
                    
                    processedResults.forEach(poi => {
                        if (!seenIds.has(poi.id)) {
                            seenIds.add(poi.id);
                            uniquePOIs.push(poi);
                        }
                    });
                    
                    resolve(uniquePOIs);
                } else {
                    console.warn('⚠️ Historical text search failed:', status);
                    // Fallback a búsqueda normal por tipos
                    searchHistoricalPlacesFallback(location, radius)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Fallback para búsqueda de lugares históricos usando tipos de Google Places
     * @param {Object} location - Google Maps LatLng
     * @param {number} radius - Radio en metros
     * @returns {Promise<Array>} - Array de POIs
     */
    function searchHistoricalPlacesFallback(location, radius) {
        return new Promise((resolve, reject) => {
            console.log('🔄 Using fallback for historical places...');
            const types = ['tourist_attraction', 'museum', 'church', 'castle', 'monument'];
            const allResults = [];
            let totalSearches = types.length;
            let searchesCompleted = 0;

            const checkCompletion = () => {
                searchesCompleted++;
                if (searchesCompleted === totalSearches) {
                    const uniquePOIs = [];
                    const seenIds = new Set();
                    
                    allResults.forEach(poi => {
                        if (!seenIds.has(poi.id)) {
                            seenIds.add(poi.id);
                            uniquePOIs.push(poi);
                        }
                    });
                    
                    resolve(uniquePOIs);
                }
            };

            types.forEach(type => {
                const request = {
                    location: location,
                    radius: radius,
                    type: type
                };

                placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const processedResults = results.map(place => 
                            processGooglePlace(place, 'historical')
                        );
                        allResults.push(...processedResults);
                    }
                    checkCompletion();
                });
            });
        });
    }

    /**
     * Fallback para búsqueda de lugares de naturaleza
     * @param {Object} location - Google Maps LatLng
     * @param {number} radius - Radio en metros
     * @returns {Promise<Array>} - Array de POIs
     */
    function searchNaturePlacesFallback(location, radius) {
        return new Promise((resolve, reject) => {
            console.log('🔄 Using fallback nature search...');
            
            const types = CATEGORY_MAPPING['nature'] || [];
            const allResults = [];
            let totalSearches = types.length;
            let searchesCompleted = 0;

            if (totalSearches === 0) {
                resolve([]);
                return;
            }

            const checkCompletion = () => {
                searchesCompleted++;
                if (searchesCompleted === totalSearches) {
                    const uniquePOIs = [];
                    const seenIds = new Set();
                    
                    allResults.forEach(poi => {
                        if (!seenIds.has(poi.id)) {
                            seenIds.add(poi.id);
                            uniquePOIs.push(poi);
                        }
                    });
                    
                    resolve(uniquePOIs);
                }
            };

            types.forEach(type => {
                const request = {
                    location: location,
                    radius: radius,
                    type: type
                };

                placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const processedResults = results.map(place => 
                            processGooglePlace(place, 'nature')
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

