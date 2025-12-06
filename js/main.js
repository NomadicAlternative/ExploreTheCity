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
    let currentLocationInfo = { city: 'Petrer', country: 'Spain' }; // Ubicación por defecto

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
                        // Después de remover el splash, solicitar ubicación del usuario
                        requestUserLocationAfterSplash();
                    }, 500);
                }
            }, 4000);

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            UIController.showNotification('Error loading application', 'error');
        }
    }

    /**
     * Solicita la ubicación del usuario después de que termine el splash screen
     */
    function requestUserLocationAfterSplash() {
        // Dar un pequeño delay para que el usuario vea el home antes del popup
        setTimeout(() => {
            if (MapaModule.getMap()) {
                console.log('📍 Requesting user location after splash...');
                initializeUserLocation();
            }
        }, 500);
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
            updateBottomNavActive('home');
        });

        RoutingModule.onRoute('favorites', () => {
            UIController.showView('favorites');
            // Usar setTimeout para asegurar que el DOM esté completamente renderizado
            setTimeout(() => {
                loadAndDisplayFavorites();
            }, 50);
            updateBottomNavActive('favorites');
        });

        RoutingModule.onRoute('events', () => {
            UIController.showView('events');
            loadAndDisplayEvents();
            updateBottomNavActive('events');
        });

        RoutingModule.onRoute('routes', () => {
            UIController.showView('routes');
            loadAndDisplayRoutes();
            updateBottomNavActive('routes');
        });

        RoutingModule.onRoute('about', () => {
            showAboutModal();
            updateBottomNavActive('about');
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
        // Enlaces del bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                
                // Si es events, activar el filtro de events en lugar de navegar
                if (target === 'events') {
                    // Buscar el botón de filtro events y hacer click
                    const eventsFilterBtn = document.querySelector('.filter-chip[data-category="events"]');
                    if (eventsFilterBtn) {
                        eventsFilterBtn.click();
                    }
                }
                // Si es routes, mostrar modal informativo primero
                else if (target === 'routes') {
                    showRoutesInfoModal();
                } else {
                    RoutingModule.navigateTo(target);
                }
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
     * Actualiza el estado activo del bottom navigation
     * @param {string} page - Nombre de la página activa
     */
    function updateBottomNavActive(page) {
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            const itemPage = item.dataset.page;
            if (itemPage === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Configura listeners de búsqueda
     */
    function setupSearchListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchInputDesktop = document.getElementById('searchInputDesktop');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const searchSuggestionsDesktop = document.getElementById('searchSuggestionsDesktop');

        // Variables para navegación por teclado
        let currentHighlightedIndex = -1;
        let currentSuggestions = [];
        let currentInput = null;
        let currentDropdown = null;

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentInput = searchInput;
                currentDropdown = searchSuggestions;
                const value = e.target.value;
                
                if (value.length >= 2) {
                    const suggestions = getSuggestions(value);
                    currentSuggestions = suggestions;
                    showSuggestions(suggestions, searchSuggestions, value);
                    currentHighlightedIndex = -1;
                } else {
                    hideSuggestions(searchSuggestions);
                    handleSearch(value);
                }
            });

            searchInput.addEventListener('keydown', (e) => {
                handleKeyboardNavigation(e, searchSuggestions, () => currentSuggestions, 
                    (index) => { currentHighlightedIndex = index; }, 
                    () => currentHighlightedIndex);
            });

            // Cerrar al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                    hideSuggestions(searchSuggestions);
                }
            });
        }

        if (searchInputDesktop) {
            searchInputDesktop.addEventListener('input', (e) => {
                currentInput = searchInputDesktop;
                currentDropdown = searchSuggestionsDesktop;
                const value = e.target.value;
                
                if (value.length >= 2) {
                    const suggestions = getSuggestions(value);
                    currentSuggestions = suggestions;
                    showSuggestions(suggestions, searchSuggestionsDesktop, value);
                    currentHighlightedIndex = -1;
                } else {
                    hideSuggestions(searchSuggestionsDesktop);
                    handleSearch(value);
                }
            });

            searchInputDesktop.addEventListener('keydown', (e) => {
                handleKeyboardNavigation(e, searchSuggestionsDesktop, () => currentSuggestions, 
                    (index) => { currentHighlightedIndex = index; }, 
                    () => currentHighlightedIndex);
            });

            // Cerrar al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!searchInputDesktop.contains(e.target) && !searchSuggestionsDesktop.contains(e.target)) {
                    hideSuggestions(searchSuggestionsDesktop);
                }
            });
        }
    }

    /**
     * Obtiene sugerencias de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} - Array de POIs que coinciden
     */
    function getSuggestions(searchTerm) {
        if (!POIDataModule) {
            console.error('❌ POIDataModule not available');
            return [];
        }
        
        const results = POIDataModule.searchPOIs(searchTerm);
        // Limitar a máximo 8 sugerencias
        return results.slice(0, 8);
    }

    /**
     * Muestra el dropdown de sugerencias
     * @param {Array} suggestions - Array de POIs
     * @param {HTMLElement} dropdown - Elemento del dropdown
     * @param {string} searchTerm - Término de búsqueda
     */
    function showSuggestions(suggestions, dropdown, searchTerm) {
        if (!dropdown) return;

        if (suggestions.length === 0) {
            dropdown.innerHTML = `
                <div class="search-suggestions-empty">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${searchTerm}"</p>
                </div>
            `;
            dropdown.classList.add('active');
            return;
        }

        const highlightText = (text, term) => {
            const regex = new RegExp(`(${term})`, 'gi');
            return text.replace(regex, '<span class="search-suggestion-highlight">$1</span>');
        };

        const getCategoryIcon = (category) => {
            const icons = {
                historical: 'fa-landmark',
                restaurants: 'fa-utensils',
                nature: 'fa-tree',
                museums: 'fa-museum',
                parks: 'fa-tree',
                entertainment: 'fa-ticket-alt',
                shopping: 'fa-shopping-bag',
                events: 'fa-calendar'
            };
            return icons[category.toLowerCase()] || 'fa-map-marker-alt';
        };

        const html = suggestions.map((poi, index) => `
            <div class="search-suggestion-item" data-poi-index="${index}">
                <div class="search-suggestion-icon">
                    <i class="fas ${getCategoryIcon(poi.category)}"></i>
                </div>
                <div class="search-suggestion-content">
                    <div class="search-suggestion-name">${highlightText(poi.name, searchTerm)}</div>
                    <div class="search-suggestion-category">${poi.category}</div>
                </div>
            </div>
        `).join('');

        dropdown.innerHTML = html;
        dropdown.classList.add('active');

        // Agregar event listeners a cada item
        dropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const poiIndex = parseInt(item.getAttribute('data-poi-index'));
                const selectedPoi = suggestions[poiIndex];
                selectSuggestion(selectedPoi, dropdown);
            });
        });
    }

    /**
     * Oculta el dropdown de sugerencias
     * @param {HTMLElement} dropdown - Elemento del dropdown
     */
    function hideSuggestions(dropdown) {
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    /**
     * Selecciona una sugerencia
     * @param {Object} poi - POI seleccionado
     * @param {HTMLElement} dropdown - Elemento del dropdown
     */
    function selectSuggestion(poi, dropdown) {
        console.log('🎯 selectSuggestion called with POI:', poi?.name);
        
        if (!poi) {
            console.error('❌ POI is null or undefined');
            return;
        }

        console.log('📍 POI data:', poi);

        // Actualizar el input con el nombre del POI
        const searchInput = document.getElementById('searchInput');
        const searchInputDesktop = document.getElementById('searchInputDesktop');
        
        if (dropdown === document.getElementById('searchSuggestions')) {
            if (searchInput) searchInput.value = poi.name;
        } else {
            if (searchInputDesktop) searchInputDesktop.value = poi.name;
        }

        // Ocultar sugerencias
        hideSuggestions(dropdown);

        // Buscar y actualizar mapa
        handleSearch(poi.name);

        console.log('🎴 Opening POI modal...');
        // Abrir modal del POI con su categoría y el POI en un array
        UIController.openPOIModal(poi.category, [poi]);
        console.log('✅ Modal should be open now');
    }

    /**
     * Maneja la navegación por teclado en las sugerencias
     * @param {KeyboardEvent} e - Evento de teclado
     * @param {HTMLElement} dropdown - Elemento del dropdown
     * @param {Function} getSuggestions - Función para obtener sugerencias actuales
     * @param {Function} setIndex - Función para establecer el índice
     * @param {Function} getIndex - Función para obtener el índice actual
     */
    function handleKeyboardNavigation(e, dropdown, getSuggestions, setIndex, getIndex) {
        if (!dropdown.classList.contains('active')) return;

        const suggestions = getSuggestions();
        const items = dropdown.querySelectorAll('.search-suggestion-item');
        let currentIndex = getIndex();

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % items.length;
                updateHighlight(items, currentIndex);
                setIndex(currentIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                updateHighlight(items, currentIndex);
                setIndex(currentIndex);
                break;

            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0 && items[currentIndex]) {
                    items[currentIndex].click();
                }
                break;

            case 'Escape':
                hideSuggestions(dropdown);
                setIndex(-1);
                break;
        }
    }

    /**
     * Actualiza el highlight visual en las sugerencias
     * @param {NodeList} items - Lista de items
     * @param {number} index - Índice a destacar
     */
    function updateHighlight(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('highlighted');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    /**
     * Maneja la búsqueda de POIs
     * @param {string} searchTerm - Término de búsqueda
     */
    function handleSearch(searchTerm) {
        if (searchTerm.length < 2) {
            // Mostrar todos los POIs
            const allPOIs = POIDataModule.getAllPOIs();
            // Actualizar mapa solo si está disponible
            if (MapaModule.getMap()) {
                updateMapMarkers(allPOIs);
            }
            return;
        }

        const results = POIDataModule.searchPOIs(searchTerm);
        console.log(`Search results for "${searchTerm}":`, results.length);
        
        // Actualizar mapa solo si está disponible
        if (MapaModule.getMap()) {
            updateMapMarkers(results);
        }
        
        if (results.length === 0 && searchTerm.length >= 2) {
            UIController.showNotification('No results found', 'info');
        }
    }

    /**
     * Configura listeners de filtros
     */
    /**
     * Configura listeners de filtros (click y hover preview)
     */
    function setupFilterListeners() {
        // Chips móviles y desktop (ambos usan .filter-chip)
        // Excluir el enlace de favoritos que usa href
        const filterChips = document.querySelectorAll('.filter-chip[data-category]');
        
        // Variable para rastrear si estamos en desktop
        const isDesktop = window.innerWidth >= 1024;
        
        filterChips.forEach(chip => {
            // Click handler (funciona en mobile y desktop)
            chip.addEventListener('click', async () => {
                const category = chip.getAttribute('data-category');
                await handleCategoryFilter(category);
                
                // Actualizar estado activo en ambos grupos de filtros (mobile y desktop)
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                document.querySelectorAll(`.filter-chip[data-category="${category}"]`).forEach(c => c.classList.add('active'));
            });
            
            // Hover preview (solo en desktop)
            if (isDesktop) {
                chip.addEventListener('mouseenter', async () => {
                    const category = chip.getAttribute('data-category');
                    await previewCategoryOnMap(category);
                });
                
                chip.addEventListener('mouseleave', () => {
                    restoreMapMarkers();
                });
            }
        });
    }
    
    /**
     * Vista previa de categoría en el mapa (hover effect)
     * @param {string} category - Categoría a previsualizar
     */
    async function previewCategoryOnMap(category) {
        try {
            // Obtener ubicación del usuario
            const userLoc = POIDataModule.getUserLocation();
            if (!userLoc) {
                console.warn('User location not available for preview');
                return;
            }
            
            // Fetch POIs de esa categoría
            let pois;
            if (category === 'events') {
                // Para eventos, usar Ticketmaster
                const ticketmasterEvents = await TicketmasterModule.getEvents({
                    latitude: userLoc.lat,
                    longitude: userLoc.lng,
                    radius: 30,
                    size: 20
                });
                pois = ticketmasterEvents.map(event => EventsModule.eventToPOI(event));
            } else {
                // Para otras categorías, usar Google Places
                pois = await POIDataModule.fetchPOIsFromGooglePlaces(category, 5000);
            }
            
            // Actualizar mapa solo con esos POIs (preview)
            if (pois && pois.length > 0) {
                updateMapMarkers(pois);
            }
        } catch (error) {
            console.error('Error in preview:', error);
        }
    }
    
    /**
     * Restaura todos los marcadores en el mapa
     */
    function restoreMapMarkers() {
        // Obtener todos los POIs cargados
        const allPOIs = POIDataModule.getAllPOIs();
        if (allPOIs && allPOIs.length > 0) {
            updateMapMarkers(allPOIs);
        }
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
        const currentViewName = UIController.getCurrentView();
        console.log('🔄 updateFavoriteUI called, current view:', currentViewName, ', favCount:', favCount);
        
        if (currentViewName === 'favorites') {
            console.log('📋 Reloading favorites list...');
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
        const myLocationNavBtn = document.getElementById('myLocationNavBtn');
        
        if (locationBtn) {
            locationBtn.addEventListener('click', getUserLocation);
        }
        
        if (myLocationNavBtn) {
            myLocationNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                getUserLocation();
            });
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
            
            // Inicializar mapa con ubicación por defecto (se actualizará después del splash)
            const mapInstance = MapaModule.initMap('map', {
                center: config.defaultCenter || { lat: 38.4836, lng: -0.7768 },
                zoom: config.defaultZoom || 14
            });

            if (!mapInstance) {
                throw new Error('Failed to initialize map');
            }

            // Inicializar Places Service con el mapa
            POIDataModule.initPlacesService(mapInstance);

            // Cargar POIs iniciales (todas las categorías)
            console.log('🔍 Loading initial POIs...');
            loadInitialPOIs();

            // Configurar listener para cuando el mapa se mueva y se detenga
            setupMapLocationListener();

            // NO solicitar ubicación aquí - se hará después del splash
            // Actualizar con ubicación por defecto del mapa
            updateLocationFromMap();

            console.log('✅ Google Maps initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing map:', error);
            UIController.showNotification('Error loading map. Please refresh the page.', 'error');
        }
    }

    /**
     * Carga los POIs iniciales (todas las categorías)
     */
    async function loadInitialPOIs() {
        try {
            console.log('🔄 Fetching initial POIs from Google Places...');
            
            // Cargar todas las categorías con un radio de 5km
            const pois = await POIDataModule.fetchPOIsFromGooglePlaces('all', 5000);
            
            console.log(`✅ ${pois.length} initial POIs loaded`);
            
            // Actualizar marcadores en el mapa
            if (pois.length > 0) {
                updateMapMarkers(pois);
            }
        } catch (error) {
            console.error('❌ Error loading initial POIs:', error);
        }
    }

    /**
     * Inicializa la ubicación del usuario automáticamente al cargar
     */
    async function initializeUserLocation() {
        try {
            console.log('📍 Attempting to get user location...');
            
            // Intentar obtener ubicación del usuario
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log(`✅ User location detected: ${latitude}, ${longitude}`);
                        
                        // Centrar el mapa en la ubicación del usuario
                        MapaModule.centerMap(latitude, longitude, 14);
                        
                        // Actualizar la ubicación en POIDataModule
                        POIDataModule.setUserLocation(latitude, longitude);
                        
                        // Actualizar la ubicación en EventsModule para eventos de Ticketmaster
                        await EventsModule.setUserLocation(latitude, longitude);
                        console.log('🎫 Events location updated');
                        
                        // Hacer reverse geocoding y actualizar el header
                        try {
                            const locationInfo = await MapaModule.reverseGeocode(latitude, longitude);
                            if (locationInfo) {
                                updateLocationText(locationInfo.city, locationInfo.country);
                                console.log(`📍 Location set: ${locationInfo.city}, ${locationInfo.country}`);
                            }
                        } catch (error) {
                            console.error('Error in reverse geocoding:', error);
                        }
                    },
                    (error) => {
                        console.warn('⚠️ Could not get user location:', error.message);
                        console.log('Using default location (Petrer)');
                        // Si falla, actualizar con ubicación por defecto
                        updateLocationFromMap();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                console.warn('⚠️ Geolocation not supported');
                // Si no hay geolocalización, usar ubicación del mapa por defecto
                updateLocationFromMap();
            }
        } catch (error) {
            console.error('Error initializing user location:', error);
            // Fallback a ubicación del mapa
            updateLocationFromMap();
        }
    }

    /**

     * Configura el listener para detectar cambios de ubicación en el mapa
     */
    function setupMapLocationListener() {
        // Usar 'idle' para detectar cuando el usuario termina de mover el mapa
        MapaModule.onMapIdle(async (center, bounds) => {
            if (center) {
                console.log('🗺️ Map location changed:', center);
                await updateLocationFromMap();
            }
        });
    }

    /**
     * Actualiza la ubicación basándose en el centro del mapa
     */
    async function updateLocationFromMap() {
        try {
            const center = MapaModule.getMapCenter();
            if (!center) return;

            // Actualizar la ubicación del usuario en POIDataModule
            POIDataModule.setUserLocation(center.lat, center.lng);

            // Actualizar la ubicación en EventsModule para eventos de Ticketmaster
            await EventsModule.setUserLocation(center.lat, center.lng);
            console.log('🎫 Events location updated from map');

            // Hacer reverse geocoding para obtener ciudad y país
            const locationInfo = await MapaModule.reverseGeocode(center.lat, center.lng);
            
            if (locationInfo) {
                // Actualizar el texto del header
                updateLocationText(locationInfo.city, locationInfo.country);
                console.log(`📍 Location updated: ${locationInfo.city}, ${locationInfo.country}`);
            }
        } catch (error) {
            console.error('❌ Error updating location from map:', error);
        }
    }

    /**
     * Actualiza el texto de ubicación en el header
     * @param {string} city - Nombre de la ciudad
     * @param {string} country - Nombre del país
     */
    function updateLocationText(city, country) {
        // Guardar la información de ubicación actual
        currentLocationInfo = { city, country };
        
        const locationText = document.querySelector('.location-text');
        if (locationText) {
            locationText.textContent = `${city}, ${country}`;
        }
    }

    /**
     * Obtiene el texto de ubicación actual para mostrar
     * @returns {string} - Texto de ubicación formateado
     */
    function getLocationDisplayText() {
        if (currentLocationInfo.city && currentLocationInfo.country) {
            return `${currentLocationInfo.city}, ${currentLocationInfo.country}`;
        }
        return 'this area';
    }

    /**
     * Carga y muestra favoritos
     */
    function loadAndDisplayFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        
        console.log('📋 loadAndDisplayFavorites called, favoritesList element:', favoritesList);
        
        if (!favoritesList) {
            console.warn('⚠️ favoritesList element not found in DOM, retrying...');
            // Reintentar después de un breve delay
            setTimeout(() => {
                const retryList = document.getElementById('favoritesList');
                if (retryList) {
                    console.log('✅ favoritesList found on retry');
                    loadAndDisplayFavoritesInternal(retryList);
                } else {
                    console.error('❌ favoritesList still not found after retry');
                }
            }, 100);
            return;
        }

        loadAndDisplayFavoritesInternal(favoritesList);
    }

    /**
     * Función interna para cargar y mostrar favoritos
     * @param {HTMLElement} favoritesList - Elemento del DOM
     */
    function loadAndDisplayFavoritesInternal(favoritesList) {
        const favorites = FavoritesModule.getAllFavorites();
        console.log('❤️ Loading', favorites.length, 'favorites');
        console.log('📍 favoritesList element:', favoritesList);

        if (favorites.length === 0) {
            console.log('🎨 Setting empty state...');
            
            // Detectar si es móvil o desktop
            const isMobile = window.innerWidth < 1024;
            
            if (isMobile) {
                // En móvil: mostrar modal
                console.log('📱 Mobile detected - showing modal');
                favoritesList.innerHTML = ''; // Limpiar el contenedor
                showEmptyFavoritesModal();
            } else {
                // En desktop: mostrar inline
                console.log('🖥️ Desktop detected - showing inline');
                favoritesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-heart-broken"></i>
                        </div>
                        <h3 class="empty-state-title">No favorites yet</h3>
                        <p class="empty-state-description">
                            Start exploring and save your favorite places to see them here!
                        </p>
                        <a href="#home" class="empty-state-cta">
                            <i class="fas fa-compass"></i>
                            Explore Places
                        </a>
                    </div>
                `;
            }
            
            console.log('✅ Empty state set');
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
        
        console.log(`✅ Displayed ${favorites.length} favorites in DOM`);
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

        // Mostrar loading contextual
        eventsList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">Finding events near you...</p>
            </div>
        `;

        // Obtener eventos cercanos (sin límite de distancia)
        const events = EventsModule.getNearbyEvents();

        if (events.length === 0) {
            // Obtener la ubicación actual para el mensaje
            const locationText = getLocationDisplayText();
            
            eventsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <h3 class="empty-state-title">No Events Available</h3>
                    <p class="empty-state-description">
                        We couldn't find any events in <strong>${locationText}</strong>.
                    </p>
                    <div style="background: #f8f9fa; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; text-align: left;">
                        <p style="margin: 0; font-size: 0.9rem; color: #666; line-height: 1.6;">
                            <i class="fas fa-info-circle" style="color: #ffc107; margin-right: 0.5rem;"></i>
                            <strong>Note:</strong> Ticketmaster coverage is limited in some regions, including most of South America, Africa, and Asia.
                        </p>
                        <p style="margin: 0.75rem 0 0 0; font-size: 0.9rem; color: #666;">
                            <i class="fas fa-globe-americas" style="color: #28a745; margin-right: 0.5rem;"></i>
                            Try searching in: <strong>Madrid</strong>, <strong>Paris</strong>, <strong>London</strong>, <strong>New York</strong>, <strong>Los Angeles</strong>, <strong>Mexico City</strong>, <strong>Toronto</strong>, or <strong>Sydney</strong>.
                        </p>
                    </div>
                    <a href="#home" class="empty-state-cta" onclick="RoutingModule.navigateTo('home')">
                        <i class="fas fa-map-marked-alt"></i>
                        Explore Map
                    </a>
                </div>
            `;
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
     * Carga y muestra rutas basadas en favoritos
     */
    function loadAndDisplayRoutes() {
        const routesList = document.getElementById('routesList');
        
        if (!routesList) return;

        const favorites = FavoritesModule.getAllFavorites();

        if (favorites.length === 0) {
            routesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-heart-broken"></i>
                    </div>
                    <h3 class="empty-state-title">No Favorites Yet</h3>
                    <p class="empty-state-message">
                        Save your favorite places to see routes and directions here.
                        <br>
                        Start exploring and tap the ❤️ button on any place!
                    </p>
                </div>
            `;
            return;
        }

        // Limpiar contenido
        routesList.innerHTML = '';

        // Crear tarjetas de ruta para cada favorito
        favorites.forEach((fav, index) => {
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            
            // Calcular distancia si está disponible
            const distanceText = fav.distance 
                ? POIDataModule.formatDistance(fav.distance)
                : 'Distance unknown';
            
            // Estimar tiempo (aproximado: 5 km/h caminando)
            let timeText = 'Time unknown';
            if (fav.distance) {
                const hours = fav.distance / 5;
                if (hours < 1) {
                    timeText = `${Math.round(hours * 60)} min walk`;
                } else {
                    timeText = `${hours.toFixed(1)} hours walk`;
                }
            }
            
            // Icono según categoría
            const categoryIcons = {
                'historical': 'fa-landmark',
                'restaurants': 'fa-utensils',
                'nature': 'fa-tree',
                'events': 'fa-calendar-alt',
                'default': 'fa-map-marker-alt'
            };
            const icon = categoryIcons[fav.category] || categoryIcons['default'];
            
            routeCard.innerHTML = `
                <div class="route-card-header">
                    <div class="route-number">${index + 1}</div>
                    <div class="route-card-info">
                        <h3 class="route-card-title">
                            <i class="fas ${icon}"></i>
                            ${fav.name}
                        </h3>
                        <p class="route-card-category">${fav.category || 'Place'}</p>
                    </div>
                </div>
                <div class="route-card-details">
                    <div class="route-detail-item">
                        <i class="fas fa-route"></i>
                        <span>${distanceText}</span>
                    </div>
                    <div class="route-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${timeText}</span>
                    </div>
                </div>
                ${fav.description ? `<p class="route-card-description">${fav.description}</p>` : ''}
                <div class="route-card-actions">
                    <button class="route-action-btn primary" onclick="App.openDirections('${fav.id}')">
                        <i class="fas fa-directions"></i>
                        <span>Get Directions</span>
                    </button>
                    <button class="route-action-btn secondary" onclick="App.viewOnMap('${fav.id}')">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>View on Map</span>
                    </button>
                </div>
            `;
            
            routesList.appendChild(routeCard);
        });

        console.log(`🗺️ Displayed ${favorites.length} routes from favorites`);
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

    /**
     * Muestra modal informativo de Routes según tenga o no favoritos
     */
    function showRoutesInfoModal() {
        const modal = document.getElementById('routesInfoModal');
        const title = document.getElementById('routesInfoTitle');
        const message = document.getElementById('routesInfoMessage');
        const btn = document.getElementById('routesInfoBtn');
        
        if (!modal || !title || !message || !btn) return;
        
        const favoritesCount = FavoritesModule.getFavoritesCount();
        
        if (favoritesCount > 0) {
            // Usuario tiene favoritos
            title.textContent = 'Routes to Your Favorites';
            message.textContent = `We will open Google Maps with routes to all your ${favoritesCount} saved favorite places!`;
        } else {
            // Usuario NO tiene favoritos
            title.textContent = 'No Favorites Yet';
            message.textContent = 'Once you have selected favorites, you will be able to see routes to reach them. Start exploring and save your favorite places! ❤️';
        }
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Manejar cierre del modal
        const closeModal = () => {
            modal.classList.remove('active');
            
            // Si tiene favoritos, abrir Google Maps con rutas
            if (favoritesCount > 0) {
                openGoogleMapsWithRoutes();
            } else {
                // Si no tiene favoritos, navegar a la vista de routes normal
                RoutingModule.navigateTo('routes');
            }
        };
        
        btn.onclick = closeModal;
        
        // Cerrar al hacer click fuera del contenido
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
        
        console.log('📍 Routes info modal shown - Favorites:', favoritesCount);
    }

    /**
     * Muestra el modal de empty favorites (solo móvil)
     */
    function showEmptyFavoritesModal() {
        const modal = document.getElementById('emptyFavoritesModal');
        const closeBtn = document.getElementById('emptyFavoritesModalClose');
        const exploreBtn = document.getElementById('emptyFavoritesExploreBtn');
        
        if (!modal) {
            console.warn('⚠️ Empty favorites modal not found');
            return;
        }
        
        // Mostrar modal
        modal.classList.add('active');
        console.log('✅ Empty favorites modal shown');
        
        // Manejar cierre del modal
        const closeModal = () => {
            modal.classList.remove('active');
        };
        
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // Cerrar al hacer click fuera del contenido
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
        
        // El botón "Explore Places" ya tiene href="#home" así que navegará automáticamente
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                closeModal();
            });
        }
    }

    /**
     * Abre Google Maps con rutas a todos los favoritos
     */
    function openGoogleMapsWithRoutes() {
        const favorites = FavoritesModule.getAllFavorites();
        
        if (favorites.length === 0) {
            UIController.showNotification('No favorites to show routes', 'error');
            return;
        }

        // Obtener ubicación actual
        const userLocation = MapaModule.getCurrentLocation();
        
        if (!userLocation) {
            UIController.showNotification('Location not available. Please enable location services.', 'warning');
            return;
        }

        // Si solo hay un favorito, usar URL simple
        if (favorites.length === 1) {
            const fav = favorites[0];
            if (!fav.coordinates) {
                UIController.showNotification('Location not available for this place', 'error');
                return;
            }
            
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${fav.coordinates.lat},${fav.coordinates.lng}&travelmode=walking`;
            window.open(url, '_blank');
            UIController.showNotification(`Opening route to ${fav.name}`, 'success');
            return;
        }

        // Si hay múltiples favoritos, usar waypoints
        // Google Maps permite hasta 9 waypoints en la URL
        const maxWaypoints = Math.min(favorites.length - 1, 9);
        
        // El primer favorito es el destino
        const destination = favorites[0];
        if (!destination.coordinates) {
            UIController.showNotification('Invalid destination coordinates', 'error');
            return;
        }

        // Los siguientes son waypoints (hasta 9)
        const waypoints = [];
        for (let i = 1; i <= maxWaypoints && i < favorites.length; i++) {
            const fav = favorites[i];
            if (fav.coordinates) {
                waypoints.push(`${fav.coordinates.lat},${fav.coordinates.lng}`);
            }
        }

        // Construir URL de Google Maps
        let url = `https://www.google.com/maps/dir/?api=1`;
        url += `&origin=${userLocation.lat},${userLocation.lng}`;
        url += `&destination=${destination.coordinates.lat},${destination.coordinates.lng}`;
        
        if (waypoints.length > 0) {
            url += `&waypoints=${waypoints.join('|')}`;
        }
        
        url += `&travelmode=walking`;

        // Abrir Google Maps
        window.open(url, '_blank');
        
        const message = waypoints.length > 0 
            ? `Opening route with ${waypoints.length + 1} stops` 
            : `Opening route to ${destination.name}`;
        
        UIController.showNotification(message, 'success');
        
        // Informar si hay más favoritos que no se pudieron incluir
        if (favorites.length > maxWaypoints + 1) {
            setTimeout(() => {
                UIController.showNotification(`Note: Only ${maxWaypoints + 1} of ${favorites.length} favorites shown (Google Maps limit)`, 'info');
            }, 2000);
        }

        console.log(`🗺️ Opened Google Maps with route to ${favorites.length} favorites`);
    }

    /**
     * Abre direcciones en Google Maps
     * @param {string} poiId - ID del POI
     */
    function openDirections(poiId) {
        const poi = POIDataModule.getPOIById(poiId);
        if (!poi || !poi.coordinates) {
            // Intentar obtener de favoritos
            const favorites = FavoritesModule.getAllFavorites();
            const favorite = favorites.find(f => f.id === poiId);
            if (!favorite || !favorite.coordinates) {
                UIController.showNotification('Location not available', 'error');
                return;
            }
            
            const url = `https://www.google.com/maps/dir/?api=1&destination=${favorite.coordinates.lat},${favorite.coordinates.lng}`;
            window.open(url, '_blank');
            return;
        }
        
        const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.coordinates.lat},${poi.coordinates.lng}`;
        window.open(url, '_blank');
        console.log('🗺️ Opening directions to:', poi.name);
    }

    /**
     * Muestra POI en el mapa
     * @param {string} poiId - ID del POI
     */
    function viewOnMap(poiId) {
        const poi = POIDataModule.getPOIById(poiId);
        if (!poi) {
            // Intentar obtener de favoritos
            const favorites = FavoritesModule.getAllFavorites();
            const favorite = favorites.find(f => f.id === poiId);
            if (!favorite) {
                UIController.showNotification('Place not found', 'error');
                return;
            }
            
            // Navegar a home y centrar en ubicación
            RoutingModule.navigateTo('home');
            if (favorite.coordinates && MapaModule.getMap()) {
                MapaModule.getMap().setCenter(favorite.coordinates);
                MapaModule.getMap().setZoom(16);
                UIController.showNotification(`Showing ${favorite.name} on map`, 'success');
            }
            return;
        }
        
        // Navegar a home y seleccionar POI
        RoutingModule.navigateTo('home');
        selectPOI(poi);
        UIController.showNotification(`Showing ${poi.name} on map`, 'success');
    }

    // API pública
    return {
        init,
        initializeMap,
        removeFavorite,
        openDirections,
        viewOnMap
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
