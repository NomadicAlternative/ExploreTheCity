// ====================================
// Main.js - Archivo Principal
// Explore the City - Petrer
// Integra y coordina todos los módulos
// ====================================

// Importar módulos
import { MapaModule } from './modules/MapaModule.js';
import { POIDataModule } from './modules/POIDataModule.js';
import { EventsModule } from './modules/EventsModule.js';
import { FavoritesModule } from './modules/FavoritesModule.js';
import { UIController } from './modules/UIController.js';
import { RoutingModule } from './modules/RoutingModule.js';
import { ResponsiveModule } from './modules/ResponsiveModule.js';

// ====================================
// Aplicación Principal
// ====================================
const App = (() => {
    let isInitialized = false;

    /**
     * Inicializa la aplicación
     */
    async function init() {
        if (isInitialized) {
            console.warn('App already initialized');
            return;
        }

        try {
            console.log('🏰 Starting Explore the City - Petrer...');

            // 1. Inicializar módulos de UI y responsividad
            ResponsiveModule.init();
            UIController.init();

            // 2. Inicializar módulos de datos
            POIDataModule.init();
            await EventsModule.init(); // Esperar a que cargue eventos de Ticketmaster
            FavoritesModule.init();

            // 3. Establecer dependencias entre módulos
            UIController.setFavoritesModule(FavoritesModule);

            // 4. Inicializar routing
            RoutingModule.init();

            // 5. Configurar integraciones entre módulos
            setupModuleIntegrations();

            // 6. Configurar event listeners
            setupEventListeners();

            // 6. Inicializar mapa (cuando Google Maps esté listo)
            // initializeMap(); // Se llamará cuando el script de Google Maps esté cargado

            isInitialized = true;
            console.log('✅ Explore the City initialized successfully');

            // Ocultar splash screen después de 4 segundos (animaciones elaboradas)
            setTimeout(() => {
                const splashScreen = document.getElementById('splashScreen');
                if (splashScreen) {
                    // Esperar a que termine la animación antes de remover
                    setTimeout(() => {
                        splashScreen.remove();
                    }, 500);
                }
            }, 4000);

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            UIController.showNotification('Error loading application', 'error');
        }
    }

    /**
     * Configura las integraciones entre módulos
     */
    function setupModuleIntegrations() {
        // Integración Favorites + UI
        FavoritesModule.onChange((favorites) => {
            console.log('❤️ Favorites updated:', favorites.length);
            updateFavoriteUI();
            
            // Sincronizar el estado de todos los botones de favoritos
            syncAllFavoriteButtons();
        });

        // Integración Routing + UI
        RoutingModule.onRoute('home', () => {
            UIController.showView('home');
        });

        RoutingModule.onRoute('favorites', () => {
            UIController.showView('favorites');
            loadAndDisplayFavorites();
        });

        RoutingModule.onRoute('events', () => {
            UIController.showView('events');
            loadAndDisplayEvents();
        });

        RoutingModule.onRoute('routes', () => {
            UIController.showView('routes');
            loadAndDisplayRoutes();
        });

        RoutingModule.onRoute('about', () => {
            showAboutModal();
        });

        RoutingModule.onRoute('contact', () => {
            showContactModal();
        });

        // Integración Responsive + UI
        ResponsiveModule.onResize((dimensions, breakpoint) => {
            console.log('Window resized:', breakpoint);
            // Recargar vista actual si es necesario
            const currentView = UIController.getCurrentView();
            UIController.showView(currentView);
        });
    }

    /**
     * Configura los event listeners de la aplicación
     */
    function setupEventListeners() {
        // === NAVEGACIÓN ===
        setupNavigationListeners();

        // === BÚSQUEDA ===
        setupSearchListeners();

        // === FILTROS ===
        setupFilterListeners();

        // === GEOLOCALIZACIÓN ===
        setupGeolocationListeners();
    }

    /**
     * Configura listeners de navegación
     */
    function setupNavigationListeners() {
        // Enlaces del menú móvil
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                RoutingModule.navigateTo(target);
                UIController.closeSidebar();
            });
        });

        // Enlaces del menú desktop
        const navDesktopLinks = document.querySelectorAll('.nav-desktop-link');
        navDesktopLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                RoutingModule.navigateTo(target);
            });
        });

        // Enlace de favoritos en los filtros
        const favoritesFilterLinks = document.querySelectorAll('.filter-chip[href="#favorites"]');
        favoritesFilterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                RoutingModule.navigateTo('favorites');
            });
        });
    }

    /**
     * Configura listeners de búsqueda
     */
    function setupSearchListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchInputDesktop = document.getElementById('searchInputDesktop');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                handleSearch(e.target.value);
            });
        }

        if (searchInputDesktop) {
            searchInputDesktop.addEventListener('input', (e) => {
                handleSearch(e.target.value);
            });
        }
    }

    /**
     * Maneja la búsqueda de POIs
     * @param {string} searchTerm - Término de búsqueda
     */
    function handleSearch(searchTerm) {
        if (searchTerm.length < 2) {
            // Mostrar todos los POIs
            const allPOIs = POIDataModule.getAllPOIs();
            updateMapMarkers(allPOIs);
            return;
        }

        const results = POIDataModule.searchPOIs(searchTerm);
        console.log(`Search results for "${searchTerm}":`, results.length);
        updateMapMarkers(results);
        
        if (results.length === 0) {
            UIController.showNotification('No results found', 'info');
        }
    }

    /**
     * Configura listeners de filtros
     */
    function setupFilterListeners() {
        // Chips móviles y desktop (ambos usan .filter-chip)
        // Excluir el enlace de favoritos que usa href
        const filterChips = document.querySelectorAll('.filter-chip[data-category]');
        filterChips.forEach(chip => {
            chip.addEventListener('click', async () => {
                const category = chip.getAttribute('data-category');
                await handleCategoryFilter(category);
                
                // Actualizar estado activo en ambos grupos de filtros (mobile y desktop)
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                document.querySelectorAll(`.filter-chip[data-category="${category}"]`).forEach(c => c.classList.add('active'));
            });
        });
    }

    /**
     * Maneja filtrado por categoría única
     * @param {string} category - Categoría a filtrar
     */
    async function handleCategoryFilter(category) {
        console.log(`Filtering by ${category}...`);
        
        // Si es eventos, cargar de Ticketmaster y mostrar en modal
        if (category === 'events') {
            loadEventsInModal(category);
            return;
        }
        
        // Para otras categorías, cargar desde Google Places y mostrar en modal
        await loadPOIsByCategoryInModal(category);
    }

    /**
     * Carga POIs por categoría desde Google Places y los muestra en modal
     * @param {string} category - Categoría a cargar
     */
    async function loadPOIsByCategoryInModal(category) {
        try {
            UIController.showLoading(true);
            
            // Obtener ubicación del usuario
            const userLoc = POIDataModule.getUserLocation();
            if (!userLoc) {
                throw new Error('User location not available');
            }

            // Fetch POIs desde Google Places
            const pois = await POIDataModule.fetchPOIsFromGooglePlaces(category, 5000);
            
            if (pois.length === 0) {
                UIController.showNotification(`No places found in ${category} category`, 'info');
                // Abrir modal vacío
                UIController.openPOIModal(category, []);
                UIController.showLoading(false);
                return;
            }

            // Actualizar mapa con marcadores
            updateMapMarkers(pois);
            
            // Abrir modal con los POIs
            UIController.openPOIModal(category, pois);
            
            UIController.showLoading(false);
        } catch (error) {
            console.error('Error loading POIs:', error);
            UIController.showNotification('Error loading places. Please try again.', 'error');
            UIController.showLoading(false);
        }
    }

    /**
     * Carga eventos de Ticketmaster y los muestra en modal
     * @param {string} category - Categoría (events)
     */
    function loadEventsInModal(category) {
        try {
            UIController.showLoading(true);
            
            // Obtener eventos desde Ticketmaster
            const events = EventsModule.getNearbyEvents();
            
            if (events.length === 0) {
                UIController.showNotification('No events found nearby', 'info');
                UIController.openPOIModal(category, []);
                UIController.showLoading(false);
                return;
            }

            // Convertir eventos a formato POI
            const eventPOIs = events.map(event => convertEventToPOI(event));
            
            // Actualizar mapa con marcadores de eventos
            updateMapMarkers(eventPOIs);
            
            // Abrir modal con eventos como POIs
            UIController.openPOIModal(category, eventPOIs);
            
            UIController.showLoading(false);
            UIController.showNotification(`${events.length} events loaded`, 'success');
            
        } catch (error) {
            console.error('Error loading events:', error);
            UIController.showNotification('Error loading events. Please try again.', 'error');
            UIController.showLoading(false);
        }
    }

    /**
     * Convierte un evento a formato POI
     * @param {Object} event - Evento de Ticketmaster
     * @returns {Object} - POI formateado
     */
    function convertEventToPOI(event) {
        // Formatear fecha y hora para la descripción
        const date = EventsModule.formatEventDate(event.date);
        const time = EventsModule.formatEventTime(event.time);
        const location = event.location + (event.city ? ', ' + event.city : '');
        
        // Crear descripción con info del evento
        const description = `📅 ${date} at ${time} | 📍 ${location}`;
        
        // Determinar precio
        let priceInfo = '';
        if (event.priceRange) {
            priceInfo = `${event.priceRange.min}-${event.priceRange.max} ${event.priceRange.currency}`;
        }
        
        return {
            id: event.id,
            name: event.name,
            description: description,
            category: 'events',
            rating: 0, // Eventos no tienen rating
            totalRatings: 0,
            coordinates: event.coordinates,
            address: location,
            distance: event.distance,
            isOpen: null, // Eventos no tienen horario de apertura
            priceLevel: priceInfo, // Usar el precio del evento
            photo: event.image || null,
            photos: event.image ? [event.image] : [],
            source: 'ticketmaster',
            url: event.url, // URL para comprar tickets
            eventDate: date,
            eventTime: time
        };
    }

    /**
     * Selecciona un POI y centra el mapa
     * @param {Object} poi - POI a seleccionar
     */
    function selectPOI(poi) {
        POIDataModule.setCurrentPOI(poi);
        
        // Centrar mapa en el POI
        MapaModule.centerMap(poi.coordinates.lat, poi.coordinates.lng, 16);
        
        // Highlight en el mapa (opcional)
        console.log('POI selected:', poi.name);
        
        UIController.showNotification(`Selected: ${poi.name}`);
    }

    /**
     * Toggle favorito de un POI
     * @param {string} poiId - ID del POI
     */
    function togglePOIFavorite(poiId) {
        const poi = POIDataModule.getPOIById(poiId);
        if (!poi) {
            console.error('❌ POI not found:', poiId);
            UIController.showNotification('Place not found', 'error');
            return;
        }
        
        // Usar la función de UIController que maneja todo
        UIController.toggleFavorite(poi);
        
        console.log('✅ Favorite toggled via main.js:', poi.name);
    }

    /**
     * Sincroniza todos los botones de favoritos en la página
     */
    function syncAllFavoriteButtons() {
        // Obtener todos los botones de favoritos
        const favoriteButtons = document.querySelectorAll('.favorite-btn[data-poi-id]');
        
        favoriteButtons.forEach(btn => {
            const poiId = btn.getAttribute('data-poi-id');
            const isFavorite = FavoritesModule.isFavorite(poiId);
            
            // Actualizar el icono
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            }
            
            // Actualizar atributos de accesibilidad
            const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
        });
        
        console.log(`🔄 Synced ${favoriteButtons.length} favorite buttons`);
    }

    /**
     * Actualiza la UI de favoritos
     */
    function updateFavoriteUI() {
        // Actualizar contador de favoritos (si existe)
        const favCount = FavoritesModule.getFavoritesCount();
        const favBadges = document.querySelectorAll('.favorites-count, .favorite-badge');
        
        favBadges.forEach(badge => {
            badge.textContent = favCount;
            badge.style.display = favCount > 0 ? 'flex' : 'none';
        });
        
        // Si estamos en la vista de favoritos, recargar
        if (UIController.getCurrentView() === 'favorites') {
            loadAndDisplayFavorites();
        }
    }

    /**
     * Sincroniza todos los botones de favoritos en la página
     */
    function syncAllFavoriteButtons() {
        // Obtener todos los botones de favoritos
        const favoriteButtons = document.querySelectorAll('.favorite-btn[data-poi-id]');
        
        favoriteButtons.forEach(btn => {
            const poiId = btn.getAttribute('data-poi-id');
            const isFavorite = FavoritesModule.isFavorite(poiId);
            
            // Actualizar el icono
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            }
            
            // Actualizar atributos de accesibilidad
            const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
        });
        
        console.log(`🔄 Synced ${favoriteButtons.length} favorite buttons`);
    }

    /**
     * Abre direcciones a un POI
     * @param {string} poiId - ID del POI
     */
    function openPOIDirections(poiId) {
        const poi = POIDataModule.getPOIById(poiId);
        if (!poi) {
            console.error('POI not found:', poiId);
            UIController.showNotification('Place not found', 'error');
            return;
        }
        
        if (!poi.coordinates || !poi.coordinates.lat || !poi.coordinates.lng) {
            console.error('POI coordinates not available:', poi);
            UIController.showNotification('Location not available for this place', 'error');
            return;
        }
        
        const { lat, lng } = poi.coordinates;
        
        // URL de Google Maps Directions API
        // Incluir el nombre del lugar como parámetro adicional
        const destinationParam = poi.address 
            ? encodeURIComponent(poi.address)
            : `${lat},${lng}`;
        
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}&destination_place_id=${poi.id}`;
        
        // Abrir en nueva pestaña
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Notificación
        UIController.showNotification(`Opening directions to ${poi.name}...`, 'info');
        
        console.log(`🗺️ Directions opened for: ${poi.name}`);
        console.log(`   Coordinates: ${lat}, ${lng}`);
        console.log(`   URL: ${url}`);
    }

    /**
     * Muestra información detallada de un POI
     * @param {string} poiId - ID del POI
     */
    function showPOIInfo(poiId) {
        const poi = POIDataModule.getPOIById(poiId);
        if (!poi) return;
        
        const distance = poi.distance ? POIDataModule.formatDistance(poi.distance) : 'N/A';
        const priceLevel = poi.priceLevel ? POIDataModule.formatPriceLevel(poi.priceLevel) : 'N/A';
        const openStatus = poi.isOpen === true ? 'Open now ✅' : poi.isOpen === false ? 'Closed ❌' : 'Hours not available';
        
        const info = `
${poi.name}

⭐ Rating: ${poi.rating.toFixed(1)}/5.0${poi.totalRatings ? ` (${poi.totalRatings} reviews)` : ''}
📍 Distance: ${distance}
💰 Price: ${priceLevel}
🕐 Status: ${openStatus}

📮 Address:
${poi.address}

${poi.description}

Source: Google Places
        `.trim();
        
        alert(info);
    }

    /**
     * Configura listeners de geolocalización
     */
    function setupGeolocationListeners() {
        const locationBtn = document.getElementById('locationBtn');
        
        if (locationBtn) {
            locationBtn.addEventListener('click', getUserLocation);
        }
    }

    /**
     * Obtiene la ubicación del usuario
     */
    function getUserLocation() {
        console.log('🗺️ Getting user location...');
        
        if (!MapaModule.getMap()) {
            console.error('❌ Map not initialized yet');
            UIController.showNotification('Map is not ready yet', 'error');
            return;
        }

        UIController.setLocationButtonLoading(true);

        MapaModule.getUserLocation(
            (lat, lng) => {
                console.log('✅ User location obtained:', lat, lng);
                
                // Centrar mapa en ubicación del usuario
                MapaModule.addUserMarker(lat, lng);
                
                // Ordenar POIs por distancia
                const sorted = POIDataModule.sortByDistance(lat, lng);
                updateMapMarkers(sorted);
                
                UIController.setLocationButtonLoading(false);
                UIController.showNotification('Location obtained successfully! 📍');
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                let errorMessage = '';
                
                if (error.code === 1) {
                    errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
                } else if (error.code === 2) {
                    // Error code 2: Position unavailable
                    errorMessage = 'Location unavailable. Please check:\n\n' +
                                 '1. System Location Services are enabled\n' +
                                 '2. Browser has location permission\n' +
                                 '3. WiFi/GPS is active\n\n' +
                                 'macOS: System Preferences → Security & Privacy → Location Services';
                    
                    console.log('⚠️ Location unavailable. Troubleshooting:');
                    console.log('1. Check System Preferences → Security & Privacy → Location Services');
                    console.log('2. Check browser location permissions');
                    console.log('3. Try reloading the page');
                    console.log('4. Check if WiFi is enabled (helps with location)');
                } else if (error.code === 3) {
                    errorMessage = 'Location request timeout. Please try again.';
                }
                
                UIController.setLocationButtonLoading(false);
                alert(errorMessage); // Usar alert para mostrar instrucciones completas
                UIController.showNotification('Location error - Check console for details', 'error');
            }
        );
    }

    /**
     * Actualiza los marcadores en el mapa
     * @param {Array} pois - Array de POIs
     */
    function updateMapMarkers(pois) {
        if (!MapaModule.getMap()) {
            console.warn('Map not initialized yet');
            return;
        }

        MapaModule.clearMarkers();

        pois.forEach(poi => {
            MapaModule.addMarker({
                position: poi.coordinates,
                title: poi.name,
                icon: getCategoryIcon(poi.category),
                data: poi,
                onClick: (marker, data) => {
                    handleMarkerClick(data);
                }
            });
        });
    }

    /**
     * Obtiene el icono según la categoría
     * @param {string} category - Categoría del POI
     * @returns {Object|null} - Objeto de icono de Google Maps
     */
    function getCategoryIcon(category) {
        // TODO: Implementar iconos personalizados por categoría
        return null;
    }

    /**
     * Maneja clic en marcador
     * @param {Object} poi - Datos del POI
     */
    function handleMarkerClick(poi) {
        console.log('Marker clicked:', poi.name);
        selectPOI(poi);
    }

    /**
     * Inicializa Google Maps
     */
    function initializeMap() {
        try {
            // Verificar si el mapa ya está inicializado
            if (MapaModule.getMap()) {
                console.log('⚠️ Map already initialized, skipping...');
                return;
            }

            console.log('🗺️ Initializing Google Maps...');
            const config = window.GOOGLE_MAPS_CONFIG || {};
            
            const mapInstance = MapaModule.initMap('map', {
                center: config.defaultCenter || { lat: 38.4836, lng: -0.7768 },
                zoom: config.defaultZoom || 14
            });

            if (!mapInstance) {
                throw new Error('Failed to initialize map');
            }

            // Inicializar Places Service con el mapa
            POIDataModule.initPlacesService(mapInstance);

            // Cargar POIs iniciales (categoría "all") - ya no es necesario mostrar automáticamente
            // Los usuarios deberán hacer clic en un filtro para ver los POIs en el modal
            console.log('✅ Map ready - Click on a filter to see places');

            console.log('✅ Google Maps initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing map:', error);
            UIController.showNotification('Error loading map. Please refresh the page.', 'error');
        }
    }

    /**
     * Carga y muestra favoritos
     */
    function loadAndDisplayFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        
        if (!favoritesList) return;

        const favorites = FavoritesModule.getAllFavorites();

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="empty-message">You don\'t have any saved favorites yet.</p>';
            return;
        }

        // Limpiar el contenedor
        favoritesList.innerHTML = '';

        // Crear tarjetas usando la misma función del modal pero con vista de favoritos
        favorites.forEach(fav => {
            // Obtener el POI completo para tener toda la información actualizada
            let poi = POIDataModule.getPOIById(fav.id);
            
            // Si no se encuentra el POI (puede ser un evento o puede haberse eliminado), 
            // usar los datos guardados en favoritos
            if (!poi) {
                poi = {
                    id: fav.id,
                    name: fav.name,
                    description: fav.description,
                    category: fav.category,
                    rating: fav.rating,
                    coordinates: fav.coordinates,
                    distance: fav.distance,
                    photo: fav.photo || null,
                    image: fav.image || null,
                    photos: fav.photos || []
                };
            }
            
            // Crear la tarjeta usando UIController (misma que en el modal)
            const card = UIController.createPOICard(poi, { isFavoriteView: true });
            
            // Agregar la tarjeta al contenedor
            favoritesList.appendChild(card);
        });
        
        console.log(`📋 Displayed ${favorites.length} favorites`);
    }

    /**
     * Elimina un favorito
     * @param {string} id - ID del favorito
     */
    function removeFavorite(id) {
        FavoritesModule.removeFavorite(id);
        
        // Actualizar los botones de favorito en toda la página
        UIController.updateFavoriteButtons(id, false);
        
        // Recargar la lista de favoritos
        loadAndDisplayFavorites();
        
        UIController.showNotification('Removed from favorites', 'success');
        console.log('❤️ Favorite removed and UI updated:', id);
    }

    /**
     * Carga y muestra eventos
     */
    function loadAndDisplayEvents() {
        const eventsList = document.getElementById('eventsList');
        
        if (!eventsList) return;

        // Mostrar loading
        eventsList.innerHTML = '<p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando eventos...</p>';

        // Obtener eventos cercanos (sin límite de distancia)
        const events = EventsModule.getNearbyEvents();

        if (events.length === 0) {
            eventsList.innerHTML = '<p class="empty-message">No hay eventos disponibles en este momento.</p>';
            return;
        }

        eventsList.innerHTML = events.map(event => {
            const status = EventsModule.getEventStatus(event.date);
            const statusText = EventsModule.getStatusText(status);
            const distance = event.distance ? EventsModule.formatDistance(event.distance) : 'N/A';
            const price = event.priceRange ? 
                `${event.priceRange.min}-${event.priceRange.max} ${event.priceRange.currency}` : 
                'Ver precios';
            const image = event.image || 'images/event-placeholder.jpg';

            return `
                <div class="event-card" data-event-id="${event.id}">
                    ${event.image ? `
                        <div class="event-image" style="background-image: url('${image}')"></div>
                    ` : ''}
                    <div class="event-content">
                        <div class="event-header">
                            <span class="event-status status-${status}">${statusText}</span>
                            ${event.distance ? `<span class="event-distance"><i class="fas fa-map-marker-alt"></i> ${distance}</span>` : ''}
                        </div>
                        <h3 class="poi-title">${event.name}</h3>
                        <p class="poi-description">${event.description}</p>
                        <div class="poi-details">
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>${EventsModule.formatEventDate(event.date)}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-clock"></i>
                                <span>${EventsModule.formatEventTime(event.time)}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${event.location}${event.city ? ', ' + event.city : ''}</span>
                            </div>
                            ${event.priceRange ? `
                            <div class="detail-item">
                                <i class="fas fa-ticket-alt"></i>
                                <span>${price}</span>
                            </div>
                            ` : ''}
                        </div>
                        ${event.url ? `
                        <a href="${event.url}" target="_blank" class="event-link-btn">
                            <i class="fas fa-external-link-alt"></i> Ver Tickets
                        </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Agregar event listeners a las tarjetas
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // No hacer nada si se clickeó el botón de tickets
                if (e.target.closest('.event-link-btn')) return;
                
                const eventId = card.getAttribute('data-event-id');
                const event = EventsModule.getEventById(eventId);
                if (event) {
                    showEventDetail(event);
                }
            });
        });
    }

    /**
     * Muestra el detalle de un evento
     * @param {Object} event - Evento a mostrar
     */
    function showEventDetail(event) {
        const distance = event.distance ? EventsModule.formatDistance(event.distance) : 'N/A';
        const price = event.priceRange ? 
            `Precio: ${event.priceRange.min}-${event.priceRange.max} ${event.priceRange.currency}` : 
            'Precios disponibles en el sitio web';
        
        const info = `
${event.name}

📅 Fecha: ${EventsModule.formatEventDate(event.date)}
🕐 Hora: ${EventsModule.formatEventTime(event.time)}
📍 Lugar: ${event.location}${event.city ? ', ' + event.city : ''}
${event.distance ? `🗺️ Distancia: ${distance}` : ''}
${event.venue?.address ? `📮 Dirección: ${event.venue.address}` : ''}
💰 ${price}

${event.description}

${event.organizer ? `Organiza: ${event.organizer}` : ''}
${event.genre ? `Género: ${event.genre}` : ''}

${event.url ? '¿Deseas comprar tickets?' : ''}
        `.trim();
        
        if (event.url && confirm(info)) {
            window.open(event.url, '_blank');
        } else if (!event.url) {
            alert(info);
        }
    }

    /**
     * Carga y muestra rutas (placeholder)
     */
    function loadAndDisplayRoutes() {
        const routesList = document.getElementById('routesList');
        
        if (!routesList) return;

        // TODO: Implementar módulo de rutas completo
        routesList.innerHTML = `
            <div class="route-card">
                <h3 class="poi-title">Castle Route</h3>
                <div class="poi-details">
                    <div class="detail-item">
                        <i class="fas fa-walking"></i>
                        <span>3.5 km</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>1.5 hours</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-signal"></i>
                        <span>Difficulty: Medium</span>
                    </div>
                </div>
                <p class="poi-description">Beautiful hiking trail to Petrer Castle with panoramic views.</p>
            </div>
        `;
    }

    /**
     * Muestra el modal de About
     */
    function showAboutModal() {
        alert('Explore the City - Petrer\nVersion 1.0\n\nTourist and local exploration app to discover the best places in Petrer.\n\n© 2025 - BYU Project');
    }

    /**
     * Muestra el modal de Contact
     */
    function showContactModal() {
        alert('Contact\n\nEmail: info@explorethecity.com\nPhone: +34 123 456 789\n\nDo you have suggestions? We\'d love to hear from you!');
    }

    // API pública
    return {
        init,
        initializeMap,
        removeFavorite
    };
})();

// Exponer App globalmente para callbacks
window.App = App;

// ====================================
// Inicialización cuando el DOM esté listo
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('� DOM loaded, initializing App...');
    App.init();
});
