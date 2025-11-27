// ====================================
// UIController.js
// Control de filtros, botones, navegación y vistas
// ====================================

export const UIController = (() => {
    // Referencias a elementos del DOM
    let elements = {};
    let currentView = 'home';
    let isMobile = false;
    let favoritesModule = null; // Referencia al módulo de favoritos

    /**
     * Inicializa el UIController
     * @param {Object} dependencies - Dependencias opcionales
     */
    function init(dependencies = {}) {
        // Establecer dependencias
        if (dependencies.favoritesModule) {
            favoritesModule = dependencies.favoritesModule;
        }
        
        cacheElements();
        detectDevice();
        setupEventListeners();
        console.log('✅ UIController initialized');
    }

    /**
     * Cachea referencias a elementos del DOM
     */
    function cacheElements() {
        elements = {
            // Mobile
            hamburger: document.getElementById('hamburger'),
            sidebar: document.getElementById('sidebar'),
            overlay: document.getElementById('overlay'),
            closeBtn: document.getElementById('closeBtn'),
            menuLinks: document.querySelectorAll('.menu-link'),
            searchInput: document.getElementById('searchInput'),
            filterChipsMobile: document.querySelectorAll('.filter-chip'),
            favoriteBtnMobile: document.getElementById('favoriteBtnMobile'),
            
            // Desktop
            navDesktopLinks: document.querySelectorAll('.nav-desktop-link'),
            searchInputDesktop: document.getElementById('searchInputDesktop'),
            filterCheckboxes: document.querySelectorAll('.filter-checkbox'),
            favoritesBtnDesktop: document.getElementById('favoritesBtnDesktop'),
            
            // Modal POI
            poiModal: document.getElementById('poiModal'),
            poiModalClose: document.getElementById('poiModalClose'),
            poiModalTitle: document.getElementById('poiModalTitle'),
            poiModalBody: document.getElementById('poiModalBody'),
            poiModalGrid: document.getElementById('poiModalGrid'),
            
            // Compartidos
            locationBtn: document.getElementById('locationBtn'),
            
            // Secciones
            mapSection: document.getElementById('mapSection'),
            poiCardMobile: document.getElementById('poiCardMobile'),
            poiCardDesktop: document.getElementById('poiCardDesktop'),
            favoritesSection: document.getElementById('favoritesSection'),
            eventsSection: document.getElementById('eventsSection'),
            routesSection: document.getElementById('routesSection'),
            desktopLayout: document.querySelector('.desktop-layout')
        };
    }

    /**
     * Detecta si es dispositivo móvil
     */
    function detectDevice() {
        isMobile = window.innerWidth < 1024;
        console.log('Device detected:', isMobile ? 'Mobile' : 'Desktop');
    }

    /**
     * Configura event listeners básicos de UI
     */
    function setupEventListeners() {
        // Menú hamburguesa
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', openSidebar);
        }
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closeSidebar);
        }
        if (elements.overlay) {
            elements.overlay.addEventListener('click', closeSidebar);
        }

        // Modal POI
        if (elements.poiModalClose) {
            elements.poiModalClose.addEventListener('click', closePOIModal);
        }
        if (elements.poiModal) {
            elements.poiModal.addEventListener('click', (e) => {
                // Cerrar si se hace click en el fondo oscuro (no en el contenido)
                if (e.target === elements.poiModal) {
                    closePOIModal();
                }
            });
        }

        // Tecla ESC para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.poiModal?.classList.contains('active')) {
                closePOIModal();
            }
        });

        // Responsive
        window.addEventListener('resize', handleResize);
    }

    /**
     * Abre el sidebar móvil
     */
    function openSidebar() {
        if (elements.sidebar) {
            elements.sidebar.classList.add('active');
        }
        if (elements.overlay) {
            elements.overlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el sidebar móvil
     */
    function closeSidebar() {
        if (elements.sidebar) {
            elements.sidebar.classList.remove('active');
        }
        if (elements.overlay) {
            elements.overlay.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    }

    /**
     * Abre el modal de POIs con una categoría específica
     * @param {string} category - Categoría a mostrar
     * @param {Array} pois - Array de POIs a mostrar
     */
    function openPOIModal(category, pois = []) {
        if (!elements.poiModal) return;

        // Actualizar título del modal según categoría
        updateModalTitle(category);

        // Renderizar POIs en el grid del modal
        renderPOIsInModal(pois);

        // Mostrar modal
        elements.poiModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        console.log(`📋 Modal opened with ${pois.length} POIs for category: ${category}`);
    }

    /**
     * Cierra el modal de POIs
     */
    function closePOIModal() {
        if (!elements.poiModal) return;

        elements.poiModal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Limpiar contenido después de la animación
        setTimeout(() => {
            if (elements.poiModalGrid) {
                elements.poiModalGrid.innerHTML = '';
            }
        }, 300);

        console.log('📋 Modal closed');
    }

    /**
     * Actualiza el título del modal según la categoría
     * @param {string} category - Categoría seleccionada
     */
    function updateModalTitle(category) {
        const categoryConfig = {
            all: { icon: 'fa-globe', text: 'All Places' },
            historical: { icon: 'fa-landmark', text: 'Historical Places' },
            restaurants: { icon: 'fa-utensils', text: 'Restaurants & Cafés' },
            nature: { icon: 'fa-tree', text: 'Nature & Parks' },
            events: { icon: 'fa-calendar', text: 'Events' }
        };

        const config = categoryConfig[category] || categoryConfig.all;

        if (elements.poiModalTitle) {
            elements.poiModalTitle.innerHTML = `
                <i class="fas ${config.icon}"></i>
                <span>${config.text}</span>
            `;
        }
    }

    /**
     * Renderiza los POIs en el grid del modal
     * @param {Array} pois - Array de POIs a renderizar
     */
    function renderPOIsInModal(pois) {
        if (!elements.poiModalGrid) return;

        if (pois.length === 0) {
            elements.poiModalGrid.innerHTML = `
                <p class="empty-message" style="grid-column: 1 / -1;">
                    No places found in this category
                </p>
            `;
            return;
        }

        // Limpiar grid
        elements.poiModalGrid.innerHTML = '';

        // Log para debug
        console.log(`🎨 Rendering ${pois.length} POIs in modal`);
        
        // Verificar cuántos tienen imágenes
        const withImages = pois.filter(poi => poi.photo || poi.image || (poi.photos && poi.photos.length > 0)).length;
        console.log(`📸 ${withImages} POIs have images`);

        // Renderizar cada POI
        pois.forEach((poi, index) => {
            const card = createPOICard(poi);
            elements.poiModalGrid.appendChild(card);
            
            // Log de eventos con sus URLs
            if (poi.category === 'events' || poi.source === 'ticketmaster') {
                console.log(`🎫 Event "${poi.name}" - Ticket URL: ${poi.url || poi.ticketUrl || 'N/A'}`);
                console.log(`   Image: ${poi.photo || poi.image || 'N/A'}`);
            }
        });
    }

    /**
     * Crea una tarjeta de POI para el modal
     * @param {Object} poi - Datos del POI
     * @param {Object} options - Opciones de configuración
     * @param {boolean} options.isFavoriteView - Si es true, muestra botón de eliminar en lugar de agregar
     * @returns {HTMLElement} - Elemento HTML de la tarjeta
     */
    function createPOICard(poi, options = {}) {
        const { isFavoriteView = false } = options;
        
        const card = document.createElement('div');
        card.className = 'poi-card-mobile';
        card.dataset.poiId = poi.id;

        // Determinar si es un evento
        const isEvent = poi.category === 'events' || poi.source === 'ticketmaster';

        // Imagen (priorizar photo, luego image, luego photos[0])
        let imageUrl = null;
        if (poi.photo) {
            imageUrl = poi.photo;
        } else if (poi.image) {
            imageUrl = poi.image;
        } else if (poi.photos && poi.photos.length > 0) {
            imageUrl = poi.photos[0];
        }

        const imageHTML = imageUrl ? `
            <div class="poi-image" style="background-image: url('${imageUrl}')" 
                 onerror="this.classList.add('no-image'); this.style.backgroundImage='';">
            </div>
        ` : '';

        // Rating (solo para POIs, no para eventos)
        const starsHTML = !isEvent && poi.rating > 0 ? generateStars(poi.rating) : '';

        // Botón de favorito o eliminar según la vista
        let favoriteBtnHTML = '';
        if (isFavoriteView) {
            // Vista de favoritos: botón de eliminar
            favoriteBtnHTML = `
                <button class="favorite-remove-btn" data-poi-id="${poi.id}" aria-label="Remove from favorites">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        } else {
            // Vista normal: botón de agregar/quitar favoritos
            const isFavorite = checkIfFavorite(poi.id);
            const heartClass = isFavorite ? 'fas' : 'far';
            favoriteBtnHTML = `
                <button class="favorite-btn" data-poi-id="${poi.id}" aria-label="Add to favorites">
                    <i class="${heartClass} fa-heart"></i>
                </button>
            `;
        }

        // Estado abierto/cerrado (solo para POIs, no eventos)
        let statusHTML = '';
        if (!isEvent && poi.isOpen !== undefined) {
            const isOpen = poi.isOpen;
            const statusClass = isOpen ? 'status-open' : 'status-closed';
            const statusText = isOpen ? 'Open now' : 'Closed';
            statusHTML = `
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span class="${statusClass}">${statusText}</span>
                </div>
            `;
        }

        // Para eventos, mostrar fecha y hora
        let eventDateHTML = '';
        if (isEvent) {
            if (poi.eventDate && poi.eventTime) {
                eventDateHTML = `
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${poi.eventDate}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${poi.eventTime}</span>
                    </div>
                `;
            } else if (poi.date) {
                // Formatear fecha si viene en formato raw
                const date = new Date(poi.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                eventDateHTML = `
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                `;
            }
        }

        // Precio
        let priceHTML = '';
        if (poi.priceLevel) {
            const priceText = isEvent ? poi.priceLevel : formatPriceLevel(poi.priceLevel);
            priceHTML = `
                <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${priceText}</span>
                </div>
            `;
        }

        card.innerHTML = `
            ${imageHTML}
            <div class="poi-header">
                <h3 class="poi-title">${poi.name}</h3>
                ${favoriteBtnHTML}
            </div>
            ${starsHTML ? `
                <div class="poi-rating">
                    ${starsHTML}
                    <span class="rating-text">(${(poi.rating || 0).toFixed(1)}${poi.totalRatings ? ` - ${poi.totalRatings} reviews` : ''})</span>
                </div>
            ` : ''}
            <p class="poi-description">${poi.description || 'No description available'}</p>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${poi.distance || 'Unknown distance'}</span>
                </div>
                ${statusHTML}
                ${eventDateHTML}
                ${priceHTML}
                ${poi.address ? `
                    <div class="detail-item">
                        <i class="fas fa-location-dot"></i>
                        <span>${poi.address}</span>
                    </div>
                ` : ''}
            </div>
            ${createActionButtons(poi)}
        `;

        // Añadir event listeners
        setupCardEventListeners(card, poi, { isFavoriteView });

        return card;
    }

    /**
     * Formatea el nivel de precio
     * @param {number|string} priceLevel - Nivel de precio (1-4) o string
     * @returns {string} - Precio formateado
     */
    function formatPriceLevel(priceLevel) {
        if (typeof priceLevel === 'string') return priceLevel;
        
        const levels = {
            1: '$ (Económico)',
            2: '$$ (Moderado)',
            3: '$$$ (Caro)',
            4: '$$$$ (Muy caro)'
        };
        return levels[priceLevel] || 'N/A';
    }

    /**
     * Crea los botones de acción para un POI
     * @param {Object} poi - Datos del POI
     * @returns {string} - HTML de los botones
     */
    function createActionButtons(poi) {
        const isEvent = poi.category === 'events' || poi.source === 'ticketmaster';
        let buttonsHTML = '<div class="poi-actions">';

        // Para EVENTOS: Botón de tickets prioritario
        if (isEvent) {
            // Botón de tickets (prioridad: url, ticketUrl)
            const ticketUrl = poi.url || poi.ticketUrl;
            if (ticketUrl) {
                buttonsHTML += `
                    <a href="${ticketUrl}" target="_blank" rel="noopener noreferrer" class="action-btn event-ticket-btn">
                        <i class="fas fa-ticket-alt"></i> Get Tickets
                    </a>
                `;
            }

            // Botón de direcciones al venue
            if (poi.coordinates || poi.location) {
                buttonsHTML += `
                    <button class="action-btn" data-action="directions" data-poi-id="${poi.id}">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                `;
            }

            // Botón de más información
            if (poi.url && !ticketUrl) {
                buttonsHTML += `
                    <a href="${poi.url}" target="_blank" rel="noopener noreferrer" class="action-btn">
                        <i class="fas fa-info-circle"></i> More Info
                    </a>
                `;
            }
        } else {
            // Para POIs normales: botones estándar
            
            // Botón de direcciones (siempre disponible si hay coordenadas)
            if (poi.coordinates || poi.location) {
                buttonsHTML += `
                    <button class="action-btn" data-action="directions" data-poi-id="${poi.id}">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                `;
            }

            // Botón de teléfono
            if (poi.phone) {
                buttonsHTML += `
                    <a href="tel:${poi.phone}" class="action-btn">
                        <i class="fas fa-phone"></i> Call
                    </a>
                `;
            }

            // Botón de sitio web
            if (poi.website || poi.url) {
                const websiteUrl = poi.website || poi.url;
                buttonsHTML += `
                    <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="action-btn">
                        <i class="fas fa-globe"></i> Website
                    </a>
                `;
            }
        }

        buttonsHTML += '</div>';
        return buttonsHTML;
    }

    /**
     * Configura event listeners para una tarjeta de POI
     * @param {HTMLElement} card - Elemento de la tarjeta
     * @param {Object} poi - Datos del POI
     * @param {Object} options - Opciones de configuración
     */
    function setupCardEventListeners(card, poi, options = {}) {
        const { isFavoriteView = false, onRemove = null } = options;
        
        // Botón de favoritos (agregar/quitar)
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(poi); // Pasar el objeto completo POI
            });
        }

        // Botón de eliminar (en vista de favoritos)
        const removeBtn = card.querySelector('.favorite-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onRemove && typeof onRemove === 'function') {
                    onRemove(poi.id);
                } else {
                    // Eliminar de favoritos
                    if (favoritesModule && typeof favoritesModule.removeFavorite === 'function') {
                        favoritesModule.removeFavorite(poi.id);
                        updateFavoriteButtons(poi.id, false);
                        
                        // Eliminar la tarjeta del DOM con animación
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                        
                        showNotification(`${poi.name} removed from favorites`, 'success');
                        console.log('❤️ Favorite removed:', poi.name);
                    }
                }
            });
        }

        // Botón de direcciones
        const directionsBtn = card.querySelector('[data-action="directions"]');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                getDirections(poi);
            });
        }

        // Click en toda la tarjeta para centrar en mapa (solo si no es vista de favoritos)
        if (!isFavoriteView) {
            card.addEventListener('click', () => {
                centerMapOnPOI(poi);
            });
        }
    }

    /**
     * Verifica si un POI es favorito
     * @param {string} poiId - ID del POI
     * @returns {boolean} - true si es favorito
     */
    function checkIfFavorite(poiId) {
        if (favoritesModule && typeof favoritesModule.isFavorite === 'function') {
            return favoritesModule.isFavorite(poiId);
        }
        return false;
    }

    /**
     * Toggle favorito de un POI
     * @param {Object} poi - Objeto completo del POI
     */
    function toggleFavorite(poi) {
        if (!poi || !poi.id) {
            console.error('Invalid POI for favorite toggle');
            return;
        }

        // Verificar si FavoritesModule está disponible
        if (!favoritesModule || typeof favoritesModule.toggleFavorite !== 'function') {
            console.error('FavoritesModule not available');
            showNotification('Favorites feature not available', 'error');
            return;
        }

        // Toggle el favorito
        const isFavorite = favoritesModule.toggleFavorite(poi);
        
        // Actualizar TODOS los botones de favoritos con este POI ID
        updateFavoriteButtons(poi.id, isFavorite);
        
        // Notificación
        const message = isFavorite 
            ? `${poi.name} added to favorites ❤️` 
            : `${poi.name} removed from favorites`;
        showNotification(message, 'success');
        
        console.log(`❤️ Favorite toggled: ${poi.name} - isFavorite: ${isFavorite}`);
    }

    /**
     * Actualiza todos los botones de favoritos para un POI específico
     * @param {string} poiId - ID del POI
     * @param {boolean} isFavorite - Estado de favorito
     */
    function updateFavoriteButtons(poiId, isFavorite) {
        // Buscar TODOS los botones con este POI ID
        const buttons = document.querySelectorAll(`.favorite-btn[data-poi-id="${poiId}"]`);
        
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                // Cambiar clase del icono (fas = relleno, far = outline)
                icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            }
            
            // Actualizar atributos de accesibilidad
            const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
        });
        
        console.log(`Updated ${buttons.length} favorite buttons for POI: ${poiId}`);
    }

    /**
     * Obtener direcciones a un POI
     * @param {Object} poi - Datos del POI
     */
    function getDirections(poi) {
        if (!poi || !poi.coordinates) {
            console.error('POI or coordinates not available');
            showNotification('Cannot get directions - location not available', 'error');
            return;
        }
        
        const { lat, lng } = poi.coordinates;
        
        // Crear URL de Google Maps Directions
        // api=1 usa la nueva Google Maps API
        // destination puede ser coordenadas lat,lng o place_id
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        
        // Abrir en nueva pestaña
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Notificación al usuario
        showNotification(`Opening directions to ${poi.name}...`, 'info');
        
        console.log(`🗺️ Opening directions to: ${poi.name} (${lat}, ${lng})`);
    }

    /**
     * Centrar mapa en un POI
     * @param {Object} poi - Datos del POI
     */
    function centerMapOnPOI(poi) {
        // Esta función será manejada por el módulo de mapa
        if (window.MapaModule && typeof window.MapaModule.centerOnPOI === 'function') {
            window.MapaModule.centerOnPOI(poi);
        }
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    function handleResize() {
        const wasMobile = isMobile;
        detectDevice();
        
        if (wasMobile !== isMobile) {
            console.log('Device changed to:', isMobile ? 'Mobile' : 'Desktop');
            // Recargar vista actual
            showView(currentView);
        }
    }

    /**
     * Muestra una vista específica
     * @param {string} viewName - Nombre de la vista
     */
    function showView(viewName) {
        hideAllSections();
        currentView = viewName;

        switch(viewName) {
            case 'home':
                showHomeView();
                break;
            case 'favorites':
                showFavoritesView();
                break;
            case 'events':
                showEventsView();
                break;
            case 'routes':
                showRoutesView();
                break;
            default:
                showHomeView();
        }

        updateActiveNavLinks(viewName);
    }

    /**
     * Muestra la vista home
     */
    function showHomeView() {
        if (isMobile) {
            if (elements.mapSection) elements.mapSection.classList.remove('hidden');
            if (elements.poiCardMobile) elements.poiCardMobile.classList.remove('hidden');
        } else {
            if (elements.desktopLayout) elements.desktopLayout.style.display = 'grid';
        }
    }

    /**
     * Muestra la vista de favoritos
     */
    function showFavoritesView() {
        if (elements.favoritesSection) {
            elements.favoritesSection.classList.remove('hidden');
        }
    }

    /**
     * Muestra la vista de eventos
     */
    function showEventsView() {
        if (elements.eventsSection) {
            elements.eventsSection.classList.remove('hidden');
        }
    }

    /**
     * Muestra la vista de rutas
     */
    function showRoutesView() {
        if (elements.routesSection) {
            elements.routesSection.classList.remove('hidden');
        }
    }

    /**
     * Oculta todas las secciones
     */
    function hideAllSections() {
        if (isMobile) {
            if (elements.mapSection) elements.mapSection.classList.add('hidden');
            if (elements.poiCardMobile) elements.poiCardMobile.classList.add('hidden');
        } else {
            if (elements.desktopLayout) elements.desktopLayout.style.display = 'none';
        }
        
        if (elements.favoritesSection) elements.favoritesSection.classList.add('hidden');
        if (elements.eventsSection) elements.eventsSection.classList.add('hidden');
        if (elements.routesSection) elements.routesSection.classList.add('hidden');
    }

    /**
     * Actualiza los links de navegación activos
     * @param {string} activeView - Vista activa
     */
    function updateActiveNavLinks(activeView) {
        // Mobile
        elements.menuLinks.forEach(link => {
            const href = link.getAttribute('href')?.substring(1);
            if (href === activeView) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Desktop
        elements.navDesktopLinks.forEach(link => {
            const href = link.getAttribute('href')?.substring(1);
            if (href === activeView) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Actualiza el botón de favorito
     * @param {boolean} isFavorite - Si el POI actual es favorito
     */
    function updateFavoriteButton(isFavorite) {
        const iconClass = isFavorite ? 'fas' : 'far';
        
        if (elements.favoriteBtnMobile) {
            elements.favoriteBtnMobile.innerHTML = `<i class="${iconClass} fa-heart"></i>`;
        }
    }

    /**
     * Actualiza los chips de filtro
     * @param {string} activeCategory - Categoría activa
     */
    function updateFilterChips(activeCategory) {
        elements.filterChipsMobile.forEach(chip => {
            const category = chip.getAttribute('data-category');
            if (category === activeCategory) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    /**
     * Actualiza los checkboxes de filtro (desktop)
     * @param {Array} activeCategories - Categorías activas
     */
    function updateFilterCheckboxes(activeCategories) {
        elements.filterCheckboxes.forEach(checkbox => {
            const category = checkbox.getAttribute('data-category');
            checkbox.checked = activeCategories.includes(category);
        });
    }

    /**
     * Muestra el botón de geolocalización como cargando
     * @param {boolean} isLoading - Si está cargando
     */
    function setLocationButtonLoading(isLoading) {
        if (elements.locationBtn) {
            if (isLoading) {
                elements.locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                elements.locationBtn.disabled = true;
            } else {
                elements.locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                elements.locationBtn.disabled = false;
            }
        }
    }

    /**
     * Actualiza la tarjeta de POI con nueva información
     * @param {Object} poi - Datos del POI
     */
    function updatePOICard(poi) {
        if (!poi) return;

        // Mobile
        if (elements.poiCardMobile && isMobile) {
            updatePOICardMobile(poi);
        }

        // Desktop
        if (elements.poiCardDesktop && !isMobile) {
            updatePOICardDesktop(poi);
        }
    }

    /**
     * Actualiza la tarjeta de POI móvil
     * @param {Object} poi - Datos del POI
     */
    function updatePOICardMobile(poi) {
        const card = elements.poiCardMobile;
        
        // Título
        const title = card.querySelector('.poi-title');
        if (title) title.textContent = poi.name;

        // Rating
        const rating = card.querySelector('.poi-rating');
        if (rating) {
            rating.innerHTML = generateStars(poi.rating) + 
                `<span class="rating-text">(${poi.rating.toFixed(1)})</span>`;
        }

        // Descripción
        const description = card.querySelector('.poi-description');
        if (description) description.textContent = poi.description;

        // Distancia
        const distanceItem = card.querySelector('.detail-item:nth-child(1) span');
        if (distanceItem && poi.distance) {
            distanceItem.textContent = poi.distance;
        }

        // Estado (abierto/cerrado)
        const statusItem = card.querySelector('.detail-item:nth-child(2) span');
        if (statusItem && poi.hours) {
            statusItem.textContent = poi.hours;
        }
    }

    /**
     * Actualiza la tarjeta de POI desktop
     * @param {Object} poi - Datos del POI
     */
    function updatePOICardDesktop(poi) {
        const card = elements.poiCardDesktop;
        
        // Tag de categoría
        const tag = card.querySelector('.poi-tag');
        if (tag) tag.textContent = poi.category.charAt(0).toUpperCase() + poi.category.slice(1);

        // Título
        const title = card.querySelector('.poi-title-desktop');
        if (title) title.textContent = poi.name;

        // Rating
        const rating = card.querySelector('.poi-rating-desktop');
        if (rating) {
            rating.innerHTML = generateStars(poi.rating);
        }

        // Descripción
        const description = card.querySelector('.poi-description-desktop');
        if (description) description.textContent = poi.description;
    }

    /**
     * Genera HTML de estrellas según rating
     * @param {number} rating - Rating del 0 al 5
     * @returns {string} - HTML de estrellas
     */
    function generateStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return starsHTML;
    }

    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación ('success', 'error', 'info')
     * @param {number} duration - Duración en ms
     */
    function showNotification(message, type = 'success', duration = 3000) {
        const colors = {
            success: '#3D5A80',
            error: '#EE6C4D',
            info: '#98C1D9',
            warning: '#F4A261'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.success};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideUp 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Muestra un modal de confirmación
     * @param {string} message - Mensaje del modal
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    function showConfirmModal(message, onConfirm, onCancel) {
        // TODO: Implementar modal personalizado
        const confirmed = confirm(message);
        if (confirmed && onConfirm) {
            onConfirm();
        } else if (!confirmed && onCancel) {
            onCancel();
        }
    }

    /**
     * Muestra un loading overlay
     * @param {boolean} show - Si mostrar u ocultar
     */
    function showLoading(show) {
        let loader = document.getElementById('app-loader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'app-loader';
                loader.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                `;
                loader.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: white;"></i>';
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }

    /**
     * Obtiene la vista actual
     * @returns {string} - Nombre de la vista actual
     */
    function getCurrentView() {
        return currentView;
    }

    /**
     * Verifica si es dispositivo móvil
     * @returns {boolean} - true si es móvil
     */
    function isMobileDevice() {
        return isMobile;
    }

    /**
     * Obtiene un elemento del DOM cacheado
     * @param {string} name - Nombre del elemento
     * @returns {Element|null} - Elemento del DOM
     */
    function getElement(name) {
        return elements[name] || null;
    }

    /**
     * Establece el módulo de favoritos
     * @param {Object} module - Módulo de favoritos
     */
    function setFavoritesModule(module) {
        favoritesModule = module;
        console.log('✅ FavoritesModule set in UIController');
    }

    // API pública del módulo
    return {
        init,
        showView,
        openSidebar,
        closeSidebar,
        openPOIModal,
        closePOIModal,
        updateFavoriteButton,
        updateFilterChips,
        updateFilterCheckboxes,
        setLocationButtonLoading,
        updatePOICard,
        showNotification,
        showConfirmModal,
        showLoading,
        getCurrentView,
        isMobileDevice,
        getElement,
        setFavoritesModule,       // Nueva función para establecer el módulo
        toggleFavorite,           // Agregar función de toggle favoritos
        updateFavoriteButtons,    // Agregar función de actualización de botones
        checkIfFavorite,          // Agregar función de verificación
        createPOICard             // Exponer función para crear tarjetas
    };
})();
