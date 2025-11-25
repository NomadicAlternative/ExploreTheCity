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
            EventsModule.init();
            FavoritesModule.init();

            // 3. Inicializar routing
            RoutingModule.init();

            // 4. Configurar integraciones entre módulos
            setupModuleIntegrations();

            // 5. Configurar event listeners
            setupEventListeners();

            // 6. Inicializar mapa (cuando Google Maps esté listo)
            // initializeMap(); // Se llamará cuando el script de Google Maps esté cargado

            isInitialized = true;
            console.log('✅ Explore the City initialized successfully');

            // Mensaje de bienvenida
            setTimeout(() => {
                UIController.showNotification('Welcome to Explore the City! 🏰');
            }, 500);

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
            console.log('Favorites updated:', favorites.length);
            updateFavoriteUI();
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

        // === FAVORITOS ===
        setupFavoriteListeners();

        // === ACCIONES POI ===
        setupPOIActionListeners();
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
        // Chips móviles
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const category = chip.getAttribute('data-category');
                handleCategoryFilter(category);
                UIController.updateFilterChips(category);
            });
        });

        // Checkboxes desktop
        const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                handleCheckboxFilters();
            });
        });
    }

    /**
     * Maneja filtrado por categoría única
     * @param {string} category - Categoría a filtrar
     */
    function handleCategoryFilter(category) {
        const filtered = POIDataModule.filterByCategory(category);
        updateMapMarkers(filtered);
        console.log(`Filtered by ${category}:`, filtered.length, 'POIs');
    }

    /**
     * Maneja filtrado por múltiples categorías (checkboxes)
     */
    function handleCheckboxFilters() {
        const checkboxes = document.querySelectorAll('.filter-checkbox:checked');
        const categories = Array.from(checkboxes).map(cb => cb.getAttribute('data-category'));
        
        const filtered = POIDataModule.filterByCategories(categories);
        updateMapMarkers(filtered);
        console.log(`Filtered by [${categories.join(', ')}]:`, filtered.length, 'POIs');
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
     * Configura listeners de favoritos
     */
    function setupFavoriteListeners() {
        const favoriteBtnMobile = document.getElementById('favoriteBtnMobile');
        const favoritesBtnDesktop = document.getElementById('favoritesBtnDesktop');

        if (favoriteBtnMobile) {
            favoriteBtnMobile.addEventListener('click', () => toggleCurrentFavorite());
        }

        if (favoritesBtnDesktop) {
            favoritesBtnDesktop.addEventListener('click', () => toggleCurrentFavorite());
        }
    }

    /**
     * Alterna favorito del POI actual
     */
    function toggleCurrentFavorite() {
        const currentPOI = POIDataModule.getCurrentPOI();
        
        if (!currentPOI) {
            UIController.showNotification('No POI selected', 'error');
            return;
        }

        const isFavorite = FavoritesModule.toggleFavorite(currentPOI);
        
        if (isFavorite) {
            UIController.showNotification('Added to favorites ❤️');
        } else {
            UIController.showNotification('Removed from favorites');
        }

        updateFavoriteUI();
    }

    /**
     * Actualiza la UI de favoritos
     */
    function updateFavoriteUI() {
        const currentPOI = POIDataModule.getCurrentPOI();
        
        if (currentPOI) {
            const isFavorite = FavoritesModule.isFavorite(currentPOI.id);
            UIController.updateFavoriteButton(isFavorite);
        }
    }

    /**
     * Configura listeners de acciones de POI
     */
    function setupPOIActionListeners() {
        const directionsBtnMobile = document.getElementById('directionsBtnMobile');
        const moreInfoBtnMobile = document.getElementById('moreInfoBtnMobile');

        if (directionsBtnMobile) {
            directionsBtnMobile.addEventListener('click', openDirections);
        }

        if (moreInfoBtnMobile) {
            moreInfoBtnMobile.addEventListener('click', showMoreInfo);
        }
    }

    /**
     * Abre direcciones en Google Maps
     */
    function openDirections() {
        const currentPOI = POIDataModule.getCurrentPOI();
        
        if (!currentPOI) return;

        const { lat, lng } = currentPOI.coordinates;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        
        window.open(url, '_blank');
        UIController.showNotification('Opening Google Maps...');
    }

    /**
     * Muestra más información del POI
     */
    function showMoreInfo() {
        const currentPOI = POIDataModule.getCurrentPOI();
        
        if (!currentPOI) return;

        // TODO: Implementar modal con información detallada
        alert(`More information about: ${currentPOI.name}\n\n${currentPOI.description}\n\nAddress: ${currentPOI.address}\nPhone: ${currentPOI.phone || 'N/A'}\nHours: ${currentPOI.hours}`);
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
        POIDataModule.setCurrentPOI(poi);
        UIController.updatePOICard(poi);
        updateFavoriteUI();
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

            // Cargar POIs iniciales
            const pois = POIDataModule.getAllPOIs();
            updateMapMarkers(pois);

            // Establecer primer POI como actual
            if (pois.length > 0) {
                POIDataModule.setCurrentPOI(pois[0]);
                UIController.updatePOICard(pois[0]);
                updateFavoriteUI();
            }

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

        favoritesList.innerHTML = favorites.map(fav => `
            <div class="favorite-card">
                <div class="poi-header">
                    <h3 class="poi-title">${fav.name}</h3>
                    <button class="favorite-btn" onclick="App.removeFavorite('${fav.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <p class="poi-description">${fav.description}</p>
                <div class="poi-details">
                    <div class="detail-item">
                        <i class="fas fa-star"></i>
                        <span>${fav.rating.toFixed(1)}</span>
                    </div>
                    ${fav.distance ? `
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${POIDataModule.formatDistance(fav.distance)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Elimina un favorito
     * @param {string} id - ID del favorito
     */
    function removeFavorite(id) {
        FavoritesModule.removeFavorite(id);
        loadAndDisplayFavorites();
        UIController.showNotification('Favorite deleted');
    }

    /**
     * Carga y muestra eventos
     */
    function loadAndDisplayEvents() {
        const eventsList = document.getElementById('eventsList');
        
        if (!eventsList) return;

        const events = EventsModule.getUpcomingEvents();

        if (events.length === 0) {
            eventsList.innerHTML = '<p class="empty-message">No upcoming events at this time.</p>';
            return;
        }

        eventsList.innerHTML = events.map(event => `
            <div class="event-card">
                <h3 class="poi-title">${event.name}</h3>
                <div class="poi-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${EventsModule.formatEventDate(event.date)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${event.time}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                </div>
                <p class="poi-description">${event.description}</p>
            </div>
        `).join('');
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
