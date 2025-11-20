// ====================================
// Main.js - Archivo Principal
// Explore the City - Petrer
// ====================================

// ====================================
// Elementos del DOM
// ====================================

// Mobile
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const menuLinks = document.querySelectorAll('.menu-link');
const searchInput = document.getElementById('searchInput');
const filterChipsMobile = document.querySelectorAll('.filter-chip');
const favoriteBtnMobile = document.getElementById('favoriteBtnMobile');
const directionsBtnMobile = document.getElementById('directionsBtnMobile');
const moreInfoBtnMobile = document.getElementById('moreInfoBtnMobile');

// Desktop
const navDesktopLinks = document.querySelectorAll('.nav-desktop-link');
const searchInputDesktop = document.getElementById('searchInputDesktop');
const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
const favoritesBtnDesktop = document.getElementById('favoritesBtnDesktop');

// Compartidos
const locationBtn = document.getElementById('locationBtn');

// Secciones
const mapSection = document.getElementById('mapSection');
const poiCardMobile = document.getElementById('poiCardMobile');
const poiCardDesktop = document.getElementById('poiCardDesktop');
const favoritesSection = document.getElementById('favoritesSection');
const eventsSection = document.getElementById('eventsSection');
const routesSection = document.getElementById('routesSection');

// ====================================
// Menú Hamburguesa (Mobile)
// ====================================
function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (hamburger) {
    hamburger.addEventListener('click', openSidebar);
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
}

if (overlay) {
    overlay.addEventListener('click', closeSidebar);
}

// ====================================
// Navegación del Menú Mobile
// ====================================
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los links
        menuLinks.forEach(l => l.classList.remove('active'));
        
        // Agregar clase active al link clickeado
        link.classList.add('active');
        
        // Obtener el destino
        const target = link.getAttribute('href').substring(1);
        
        // Manejar navegación
        handleNavigation(target);
        
        // Cerrar sidebar
        closeSidebar();
    });
});

// ====================================
// Navegación Desktop
// ====================================
navDesktopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los links
        navDesktopLinks.forEach(l => l.classList.remove('active'));
        
        // Agregar clase active al link clickeado
        link.classList.add('active');
        
        const target = link.getAttribute('href').substring(1);
        handleNavigation(target);
    });
});

// ====================================
// Función de Navegación Unificada
// ====================================
function handleNavigation(target) {
    switch(target) {
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
        case 'about':
            showAboutModal();
            break;
        case 'contact':
            showContactModal();
            break;
        default:
            showHomeView();
    }
}

function showHomeView() {
    hideAllSections();
    if (window.innerWidth < 1024) {
        // Vista móvil
        if (mapSection) mapSection.classList.remove('hidden');
        if (poiCardMobile) poiCardMobile.classList.remove('hidden');
    } else {
        // Vista desktop
        const desktopLayout = document.querySelector('.desktop-layout');
        if (desktopLayout) desktopLayout.style.display = 'grid';
    }
}

function showFavoritesView() {
    hideAllSections();
    if (favoritesSection) {
        favoritesSection.classList.remove('hidden');
        loadFavorites();
    }
}

function showEventsView() {
    hideAllSections();
    if (eventsSection) {
        eventsSection.classList.remove('hidden');
        loadEvents();
    }
}

function showRoutesView() {
    hideAllSections();
    if (routesSection) {
        routesSection.classList.remove('hidden');
        loadRoutes();
    }
}

function showAboutModal() {
    alert('Explore the City - Petrer\nVersion 1.0\n\nTourist and local exploration app to discover the best places in Petrer.\n\n© 2025 - BYU Project');
}

function showContactModal() {
    alert('Contact\n\nEmail: info@explorethecity.com\nPhone: +34 123 456 789\n\nDo you have suggestions? We\'d love to hear from you!');
}

function hideAllSections() {
    const desktopLayout = document.querySelector('.desktop-layout');
    if (window.innerWidth < 1024) {
        // Ocultar secciones móviles
        if (mapSection) mapSection.classList.add('hidden');
        if (poiCardMobile) poiCardMobile.classList.add('hidden');
    } else {
        // Ocultar layout desktop
        if (desktopLayout) desktopLayout.style.display = 'none';
    }
    
    if (favoritesSection) favoritesSection.classList.add('hidden');
    if (eventsSection) eventsSection.classList.add('hidden');
    if (routesSection) routesSection.classList.add('hidden');
}

// ====================================
// Búsqueda
// ====================================
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        performSearch(searchTerm);
    });
}

if (searchInputDesktop) {
    searchInputDesktop.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        performSearch(searchTerm);
    });
}

function performSearch(searchTerm) {
    console.log('Searching:', searchTerm);
    // Here the real search will be implemented with Google Maps Places API
    if (searchTerm.length > 2) {
        console.log('Search places containing:', searchTerm);
        // TODO: Implement search with API
    }
}

// ====================================
// Filtros por Categoría (Mobile - Chips)
// ====================================
filterChipsMobile.forEach(chip => {
    chip.addEventListener('click', () => {
        // Remover active de todos los chips
        filterChipsMobile.forEach(c => c.classList.remove('active'));
        
        // Agregar active al chip clickeado
        chip.classList.add('active');
        
        const category = chip.getAttribute('data-category');
        filterPOIsByCategory(category);
    });
});

// ====================================
// Filtros por Categoría (Desktop - Checkboxes)
// ====================================
filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const activeCategories = [];
        filterCheckboxes.forEach(cb => {
            if (cb.checked) {
                activeCategories.push(cb.getAttribute('data-category'));
            }
        });
        
        console.log('Categorías activas:', activeCategories);
        filterPOIsByCategories(activeCategories);
    });
});

function filterPOIsByCategory(category) {
    console.log('Filter by category:', category);
    // TODO: Implement real filtering
}

function filterPOIsByCategories(categories) {
    console.log('Filter by categories:', categories);
    // TODO: Implement real filtering
}

// ====================================
// Geolocalización
// ====================================
if (locationBtn) {
    locationBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('Location obtained:', latitude, longitude);
                    
                    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                    
                    // TODO: Center map on user location
                    // TODO: Search nearby POIs
                    
                    showNotification('Location obtained successfully');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                    showNotification('Could not get your location', 'error');
                }
            );
        } else {
            showNotification('Your browser does not support geolocation', 'error');
        }
    });
}

// ====================================
// Sistema de Favoritos
// ====================================
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Obtener POI actual (temporal - será reemplazado con datos reales)
function getCurrentPOI() {
    return {
        id: 'poi-1',
        name: 'Historical Place',
        description: 'An interesting historical place',
        rating: 4.0,
        distance: '0.5 km',
        status: 'Open now',
        category: 'historical'
    };
}

// Verificar si el POI actual está en favoritos
function updateFavoriteButtons() {
    const currentPOI = getCurrentPOI();
    const isFavorite = favorites.some(fav => fav.id === currentPOI.id);
    
    const iconClass = isFavorite ? 'fas' : 'far';
    
    if (favoriteBtnMobile) {
        favoriteBtnMobile.innerHTML = `<i class="${iconClass} fa-heart"></i>`;
    }
}

// Toggle favorito Mobile
if (favoriteBtnMobile) {
    favoriteBtnMobile.addEventListener('click', () => {
        toggleFavorite(favoriteBtnMobile);
    });
}

// Toggle favorito Desktop
if (favoritesBtnDesktop) {
    favoritesBtnDesktop.addEventListener('click', () => {
        toggleFavorite(favoritesBtnDesktop);
    });
}

function toggleFavorite(button) {
    const currentPOI = getCurrentPOI();
    const index = favorites.findIndex(fav => fav.id === currentPOI.id);
    
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        showNotification('Removed from favorites');
    } else {
        // Add to favorites
        favorites.push(currentPOI);
        showNotification('Added to favorites ❤️');
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update UI
    updateFavoriteButtons();
    
    // Animate button
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Load favorites
function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (!favoritesList) return;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">You don\'t have any saved favorites yet.</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-card">
            <div class="poi-header">
                <h3 class="poi-title">${fav.name}</h3>
                <button class="favorite-btn" onclick="removeFavorite('${fav.id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <p class="poi-description">${fav.description}</p>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-star"></i>
                    <span>${fav.rating}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${fav.distance}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Remove favorite
window.removeFavorite = function(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    updateFavoriteButtons();
    showNotification('Favorite deleted');
};

// ====================================
// Directions (Mobile)
// ====================================
if (directionsBtnMobile) {
    directionsBtnMobile.addEventListener('click', () => {
        const currentPOI = getCurrentPOI();
        console.log('Get directions to:', currentPOI.name);
        showNotification('Opening Google Maps...');
        // TODO: Integrate with Google Maps Directions API
    });
}

// ====================================
// More Information (Mobile)
// ====================================
if (moreInfoBtnMobile) {
    moreInfoBtnMobile.addEventListener('click', () => {
        const currentPOI = getCurrentPOI();
        console.log('View more information about:', currentPOI.name);
        showNotification('Loading detailed information...');
        // TODO: Show modal with TripAdvisor/Foursquare information
    });
}

// ====================================
// Load Events (temporary)
// ====================================
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    
    if (!eventsList) return;
    
    // Sample data - TODO: Replace with Eventbrite API
    eventsList.innerHTML = `
        <div class="event-card">
            <h3 class="poi-title">Moors and Christians Festival</h3>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>May 15, 2025</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>10:00 AM - 8:00 PM</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Petrer Downtown</span>
                </div>
            </div>
            <p class="poi-description">Traditional celebration with parades, music and cultural activities.</p>
        </div>
        <div class="event-card">
            <h3 class="poi-title">Medieval Market</h3>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>May 22, 2025</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>9:00 AM - 6:00 PM</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Petrer Castle</span>
                </div>
            </div>
            <p class="poi-description">Traditional market with crafts, typical food and shows.</p>
        </div>
        <div class="event-card">
            <h3 class="poi-title">Summer Concert</h3>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>June 5, 2025</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>7:00 PM</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Main Square</span>
                </div>
            </div>
            <p class="poi-description">Outdoor concert with local and international bands.</p>
        </div>
    `;
}

// ====================================
// Load Routes (temporary)
// ====================================
function loadRoutes() {
    const routesList = document.getElementById('routesList');
    
    if (!routesList) return;
    
    // Sample data - TODO: Replace with real route data
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
        <div class="route-card">
            <h3 class="poi-title">Serra del Cid Route</h3>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-walking"></i>
                    <span>7.2 km</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>3 hours</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-signal"></i>
                    <span>Difficulty: High</span>
                </div>
            </div>
            <p class="poi-description">Mountain route with spectacular views of Petrer and surroundings.</p>
        </div>
        <div class="route-card">
            <h3 class="poi-title">Historical Urban Walk</h3>
            <div class="poi-details">
                <div class="detail-item">
                    <i class="fas fa-walking"></i>
                    <span>2.0 km</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>45 minutes</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-signal"></i>
                    <span>Difficulty: Easy</span>
                </div>
            </div>
            <p class="poi-description">Tour through the old town of Petrer discovering its history.</p>
        </div>
    `;
}

// ====================================
// Sistema de Notificaciones
// ====================================
function showNotification(message, type = 'success') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#EE6C4D' : '#3D5A80'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

// ====================================
// Initialization
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏰 Explore the City - Petrer loaded successfully');
    
    // Update favorite buttons
    updateFavoriteButtons();
    
    // Detect screen size
    const isMobile = window.innerWidth < 1024;
    console.log('Device:', isMobile ? 'Mobile' : 'Desktop');
    
    // Welcome message
    setTimeout(() => {
        showNotification('Welcome to Explore the City! 🏰');
    }, 500);
    
    // TODO: Initialize Google Maps
    console.log('📍 Ready to integrate Google Maps API');
});

// ====================================
// Responsive: Detect size changes
// ====================================
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth < 1024;
    console.log('Changed to:', isMobile ? 'Mobile' : 'Desktop');
});

