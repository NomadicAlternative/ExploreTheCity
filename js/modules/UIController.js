// ====================================
// UIController.js
// Control de filtros, botones, navegación y vistas
// ====================================

export const UIController = (() => {
    // Referencias a elementos del DOM
    let elements = {};
    let currentView = 'home';
    let isMobile = false;

    /**
     * Inicializa el UIController
     */
    function init() {
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
            info: '#98C1D9'
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

    // API pública del módulo
    return {
        init,
        showView,
        openSidebar,
        closeSidebar,
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
        getElement
    };
})();
