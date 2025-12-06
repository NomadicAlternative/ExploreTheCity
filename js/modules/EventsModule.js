// ====================================
// EventsModule.js
// Conexión con Ticketmaster API
// ====================================

export const EventsModule = (() => {
    let events = [];
    let isLoading = false;
    let userLocation = null;

    // Ticketmaster API Configuration
    const TICKETMASTER_CONFIG = {
        apiKey: 'V8dYTT7pnhAV3Lf0aY2UDjJDwdhFrA5d',
        baseUrl: 'https://app.ticketmaster.com/discovery/v2',
        defaultRadius: 200, // Radio en km (sin límite real, pero empezamos con 200km)
        locale: 'es-ES',
        countryCode: 'ES',
        size: 50 // Número de eventos a obtener
    };

    /**
     * Inicializa el módulo de eventos
     */
    async function init() {
        console.log('✅ EventsModule initialized with Ticketmaster API');
        // Intentar obtener ubicación del usuario automáticamente
        await detectUserLocation();
    }

    /**
     * Detecta la ubicación del usuario
     */
    async function detectUserLocation() {
        try {
            if ('geolocation' in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 300000 // 5 minutos
                    });
                });
                
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                console.log('📍 User location detected:', userLocation);
                
                // Cargar eventos automáticamente
                await fetchEventsFromTicketmaster();
            } else {
                console.warn('⚠️ Geolocation not available, using default location (Petrer, Spain)');
                userLocation = { lat: 38.4836, lng: -0.7768 };
                await fetchEventsFromTicketmaster();
            }
        } catch (error) {
            console.warn('⚠️ Could not get user location, using default (Petrer, Spain):', error.message);
            userLocation = { lat: 38.4836, lng: -0.7768 };
            await fetchEventsFromTicketmaster();
        }
    }

    /**
     * Establece manualmente la ubicación del usuario
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     */
    async function setUserLocation(lat, lng) {
        userLocation = { lat, lng };
        console.log('📍 User location set manually:', userLocation);
        await fetchEventsFromTicketmaster();
    }

    /**
     * Obtiene eventos desde Ticketmaster API
     * @param {Object} options - Opciones de búsqueda
     * @returns {Promise<Array>} - Promesa con los eventos
     */
    async function fetchEventsFromTicketmaster(options = {}) {
        if (!userLocation) {
            console.error('❌ User location not set');
            return [];
        }

        isLoading = true;
        console.log('🎫 Fetching events from Ticketmaster API...');

        try {
            // Parámetros base
            const params = {
                apikey: TICKETMASTER_CONFIG.apiKey,
                latlong: `${userLocation.lat},${userLocation.lng}`,
                radius: options.radius || TICKETMASTER_CONFIG.defaultRadius,
                unit: 'km',
                locale: 'en-us', // Usar inglés para mejor compatibilidad global
                size: options.size || TICKETMASTER_CONFIG.size,
                sort: 'distance,asc', // Ordenar por distancia (más cercano primero)
            };

            // Solo agregar countryCode si se especifica explícitamente en options
            // De lo contrario, dejar que Ticketmaster use las coordenadas
            if (options.countryCode) {
                params.countryCode = options.countryCode;
            }

            // Agregar parámetros adicionales
            if (options.params) {
                Object.assign(params, options.params);
            }

            const urlParams = new URLSearchParams(params);
            const url = `${TICKETMASTER_CONFIG.baseUrl}/events.json?${urlParams}`;
            console.log('🌐 API Request URL:', url);
            console.log('📍 Searching events at:', userLocation);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Procesar eventos
            events = processTicketmasterEvents(data);
            
            console.log(`✅ ${events.length} events loaded from Ticketmaster`);
            isLoading = false;
            
            return [...events];
        } catch (error) {
            console.error('❌ Error fetching events from Ticketmaster:', error);
            isLoading = false;
            events = [];
            throw error;
        }
    }

    /**
     * Procesa los datos de Ticketmaster a formato interno
     * @param {Object} data - Datos de la API
     * @returns {Array} - Eventos procesados
     */
    function processTicketmasterEvents(data) {
        if (!data._embedded || !data._embedded.events) {
            console.log('ℹ️ No events found');
            return [];
        }

        return data._embedded.events.map(event => {
            // Extraer información del venue
            const venue = event._embedded?.venues?.[0];
            const location = venue?.location || {};
            
            // Extraer categorías
            const classifications = event.classifications?.[0] || {};
            const segment = classifications.segment?.name || 'Event';
            const genre = classifications.genre?.name || '';
            
            // Extraer imágenes
            const images = event.images || [];
            const mainImage = images.find(img => img.ratio === '16_9' && img.width > 1000) || 
                            images.find(img => img.ratio === '16_9') ||
                            images[0];

            // Calcular distancia si hay coordenadas
            let distance = null;
            if (location.latitude && location.longitude && userLocation) {
                distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    parseFloat(location.latitude),
                    parseFloat(location.longitude)
                );
            }

            return {
                id: event.id,
                name: event.name,
                description: event.info || event.pleaseNote || `${segment} event${genre ? ' - ' + genre : ''}`,
                date: event.dates?.start?.localDate || null,
                time: event.dates?.start?.localTime || 'TBA',
                datetime: event.dates?.start?.dateTime || null,
                location: venue?.name || 'Location TBA',
                address: venue?.address?.line1 || '',
                city: venue?.city?.name || '',
                coordinates: location.latitude && location.longitude ? {
                    lat: parseFloat(location.latitude),
                    lng: parseFloat(location.longitude)
                } : null,
                distance: distance,
                category: mapTicketmasterCategory(segment),
                genre: genre,
                segment: segment,
                image: mainImage?.url || null,
                images: images.map(img => img.url),
                url: event.url,
                ticketUrl: event.url,
                priceRange: event.priceRanges?.[0] ? {
                    min: event.priceRanges[0].min,
                    max: event.priceRanges[0].max,
                    currency: event.priceRanges[0].currency
                } : null,
                status: event.dates?.status?.code || 'onsale',
                organizer: event.promoter?.name || venue?.name || 'Ticketmaster',
                venue: venue ? {
                    name: venue.name,
                    address: venue.address?.line1,
                    city: venue.city?.name,
                    state: venue.state?.name,
                    country: venue.country?.name,
                    postalCode: venue.postalCode
                } : null,
                rawData: event // Guardar datos originales por si se necesitan
            };
        }).filter(event => event.date); // Filtrar eventos sin fecha
    }

    /**
     * Mapea categorías de Ticketmaster a categorías internas
     * @param {string} segment - Segmento de Ticketmaster
     * @returns {string} - Categoría interna
     */
    function mapTicketmasterCategory(segment) {
        const categoryMap = {
            'Music': 'music',
            'Sports': 'sports',
            'Arts & Theatre': 'theatre',
            'Film': 'film',
            'Miscellaneous': 'other',
            'Family': 'family'
        };
        return categoryMap[segment] || 'other';
    }

    /**
     * Calcula la distancia entre dos puntos en km
     * @param {number} lat1 - Latitud punto 1
     * @param {number} lng1 - Longitud punto 1
     * @param {number} lat2 - Latitud punto 2
     * @param {number} lng2 - Longitud punto 2
     * @returns {number} - Distancia en km
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
     * Formatea la distancia para mostrar
     * @param {number} distanceKm - Distancia en km
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
     * Obtiene todos los eventos
     * @returns {Array} - Array de eventos
     */
    function getAllEvents() {
        return [...events];
    }

    /**
     * Obtiene un evento por su ID
     * @param {string} id - ID del evento
     * @returns {Object|null} - Evento encontrado o null
     */
    function getEventById(id) {
        return events.find(event => event.id === id) || null;
    }

    /**
     * Obtiene eventos próximos
     * @param {number} daysAhead - Número de días hacia adelante
     * @returns {Array} - Eventos próximos
     */
    function getUpcomingEvents(daysAhead = 90) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= futureDate;
        }).sort((a, b) => {
            // Ordenar primero por distancia, luego por fecha
            if (a.distance && b.distance) {
                if (Math.abs(a.distance - b.distance) > 0.1) {
                    return a.distance - b.distance;
                }
            }
            return new Date(a.date) - new Date(b.date);
        });
    }

    /**
     * Obtiene eventos cercanos ordenados por distancia
     * @param {number} maxDistance - Distancia máxima en km (null = sin límite)
     * @returns {Array} - Eventos ordenados por distancia
     */
    function getNearbyEvents(maxDistance = null) {
        let filtered = events.filter(event => event.coordinates && event.distance !== null);
        
        if (maxDistance !== null) {
            filtered = filtered.filter(event => event.distance <= maxDistance);
        }
        
        return filtered.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Busca eventos por término
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} - Eventos que coinciden
     */
    function searchEvents(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term.length === 0) {
            return [...events];
        }

        return events.filter(event => {
            return event.name.toLowerCase().includes(term) ||
                   event.description.toLowerCase().includes(term) ||
                   event.location.toLowerCase().includes(term) ||
                   event.city?.toLowerCase().includes(term) ||
                   event.category.toLowerCase().includes(term) ||
                   event.genre?.toLowerCase().includes(term) ||
                   event.segment?.toLowerCase().includes(term);
        });
    }

    /**
     * Filtra eventos por categoría
     * @param {string} category - Categoría del evento
     * @returns {Array} - Eventos filtrados
     */
    function filterByCategory(category) {
        if (category === 'all') {
            return [...events];
        }
        return events.filter(event => event.category === category);
    }

    /**
     * Filtra eventos por múltiples categorías
     * @param {Array} categories - Array de categorías
     * @returns {Array} - Eventos filtrados
     */
    function filterByCategories(categories) {
        if (categories.length === 0) {
            return [...events];
        }
        return events.filter(event => categories.includes(event.category));
    }

    /**
     * Obtiene eventos por rango de precio
     * @param {number} minPrice - Precio mínimo
     * @param {number} maxPrice - Precio máximo
     * @returns {Array} - Eventos filtrados
     */
    function filterByPriceRange(minPrice, maxPrice) {
        return events.filter(event => {
            if (!event.priceRange) return true; // Incluir eventos sin precio
            return event.priceRange.min >= minPrice && event.priceRange.max <= maxPrice;
        });
    }

    /**
     * Refresca los eventos desde la API
     * @param {Object} options - Opciones de búsqueda
     * @returns {Promise<Array>} - Promesa con los eventos
     */
    async function refreshEvents(options = {}) {
        console.log('🔄 Refreshing events...');
        return await fetchEventsFromTicketmaster(options);
    }

    /**
     * Busca eventos por ciudad
     * @param {string} city - Nombre de la ciudad
     * @returns {Promise<Array>} - Promesa con los eventos
     */
    async function searchEventsByCity(city) {
        isLoading = true;
        console.log(`🔍 Searching events in ${city}...`);

        try {
            // No incluir countryCode para permitir búsquedas globales
            const params = new URLSearchParams({
                apikey: TICKETMASTER_CONFIG.apiKey,
                city: city,
                locale: 'en-us', // Usar inglés para mejor compatibilidad global
                size: TICKETMASTER_CONFIG.size,
                sort: 'date,asc'
            });

            const url = `${TICKETMASTER_CONFIG.baseUrl}/events.json?${params}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Ticketmaster API error: ${response.status}`);
            }

            const data = await response.json();
            events = processTicketmasterEvents(data);
            
            console.log(`✅ ${events.length} events found in ${city}`);
            isLoading = false;
            
            return [...events];
        } catch (error) {
            console.error('❌ Error searching events by city:', error);
            isLoading = false;
            throw error;
        }
    }

    /**
     * Formatea la fecha del evento
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} - Fecha formateada
     */
    function formatEventDate(dateString) {
        if (!dateString) return 'Fecha por confirmar';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('es-ES', options);
    }

    /**
     * Formatea la hora del evento
     * @param {string} timeString - Hora en formato HH:MM:SS
     * @returns {string} - Hora formateada
     */
    function formatEventTime(timeString) {
        if (!timeString || timeString === 'TBA') return 'Por confirmar';
        
        try {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        } catch {
            return timeString;
        }
    }

    /**
     * Obtiene el estado del evento (próximo, hoy, pasado)
     * @param {string} dateString - Fecha del evento
     * @returns {string} - Estado del evento
     */
    function getEventStatus(dateString) {
        if (!dateString) return 'upcoming';
        
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'past';
        if (diffDays === 0) return 'today';
        if (diffDays <= 7) return 'this-week';
        if (diffDays <= 30) return 'this-month';
        return 'upcoming';
    }

    /**
     * Obtiene el texto del estado del evento
     * @param {string} status - Estado del evento
     * @returns {string} - Texto del estado
     */
    function getStatusText(status) {
        const statusTexts = {
            'past': 'Finalizado',
            'today': 'Hoy',
            'this-week': 'Esta semana',
            'this-month': 'Este mes',
            'upcoming': 'Próximamente'
        };
        return statusTexts[status] || 'Evento';
    }

    /**
     * Obtiene las categorías únicas de eventos
     * @returns {Array} - Array de categorías
     */
    function getCategories() {
        const categories = new Set(events.map(event => event.category));
        return Array.from(categories);
    }

    /**
     * Obtiene estadísticas de eventos
     * @returns {Object} - Estadísticas
     */
    function getEventStats() {
        const upcoming = events.filter(e => getEventStatus(e.date) !== 'past');
        const today = events.filter(e => getEventStatus(e.date) === 'today');
        const thisWeek = events.filter(e => getEventStatus(e.date) === 'this-week');
        
        const categories = {};
        events.forEach(event => {
            categories[event.category] = (categories[event.category] || 0) + 1;
        });

        return {
            total: events.length,
            upcoming: upcoming.length,
            today: today.length,
            thisWeek: thisWeek.length,
            byCategory: categories,
            hasLocation: events.filter(e => e.coordinates).length
        };
    }

    /**
     * Obtiene un evento por su ID
     * @param {string} id - ID del evento
     * @returns {Object|null} - Evento encontrado o null
     */
    function getEventById(id) {
        return events.find(event => event.id === id) || null;
    }

    /**
     * Verifica si el módulo está cargando datos
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

    /**
     * Obtiene eventos de un día específico
     * @param {string} dateString - Fecha en formato YYYY-MM-DD
     * @returns {Array} - Eventos del día
     */
    function getEventsByDate(dateString) {
        return events.filter(event => event.date === dateString);
    }

    /**
     * Exporta eventos a JSON
     * @returns {string} - JSON string
     */
    function exportEvents() {
        return JSON.stringify(events, null, 2);
    }

    // API pública del módulo
    return {
        init,
        fetchEventsFromTicketmaster,
        refreshEvents,
        searchEventsByCity,
        setUserLocation,
        getAllEvents,
        getEventById,
        filterByCategory,
        filterByCategories,
        filterByPriceRange,
        getUpcomingEvents,
        getNearbyEvents,
        searchEvents,
        formatEventDate,
        formatEventTime,
        formatDistance,
        getEventStatus,
        getStatusText,
        getCategories,
        getEventStats,
        getLoadingState,
        getUserLocation,
        getEventsByDate,
        exportEvents
    };
})();

