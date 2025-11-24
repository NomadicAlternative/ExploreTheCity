// ====================================
// FavoritesModule.js
// Gestiona LocalStorage y la vista de favoritos
// ====================================

export const FavoritesModule = (() => {
    const STORAGE_KEY = 'exploreTheCity_favorites';
    let favorites = [];
    let changeCallbacks = [];

    /**
     * Inicializa el módulo de favoritos
     */
    function init() {
        loadFromStorage();
        console.log('✅ FavoritesModule initialized with', favorites.length, 'favorites');
    }

    /**
     * Carga favoritos desde localStorage
     */
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            favorites = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            favorites = [];
        }
    }

    /**
     * Guarda favoritos en localStorage
     */
    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            notifyChanges();
        } catch (error) {
            console.error('Error saving favorites to localStorage:', error);
        }
    }

    /**
     * Obtiene todos los favoritos
     * @returns {Array} - Array de favoritos
     */
    function getAllFavorites() {
        return [...favorites];
    }

    /**
     * Verifica si un POI es favorito
     * @param {string} poiId - ID del POI
     * @returns {boolean} - true si es favorito
     */
    function isFavorite(poiId) {
        return favorites.some(fav => fav.id === poiId);
    }

    /**
     * Agrega un POI a favoritos
     * @param {Object} poi - Datos del POI
     * @returns {boolean} - true si se agregó correctamente
     */
    function addFavorite(poi) {
        // Verificar si ya existe
        if (isFavorite(poi.id)) {
            console.log('POI already in favorites:', poi.id);
            return false;
        }

        const favorite = {
            id: poi.id,
            name: poi.name,
            description: poi.description,
            category: poi.category,
            rating: poi.rating,
            coordinates: poi.coordinates,
            distance: poi.distance || null,
            addedAt: new Date().toISOString()
        };

        favorites.unshift(favorite); // Agregar al inicio
        saveToStorage();
        
        console.log('✅ Added to favorites:', poi.name);
        return true;
    }

    /**
     * Elimina un POI de favoritos
     * @param {string} poiId - ID del POI
     * @returns {boolean} - true si se eliminó correctamente
     */
    function removeFavorite(poiId) {
        const index = favorites.findIndex(fav => fav.id === poiId);
        
        if (index === -1) {
            console.log('POI not in favorites:', poiId);
            return false;
        }

        const removed = favorites.splice(index, 1)[0];
        saveToStorage();
        
        console.log('✅ Removed from favorites:', removed.name);
        return true;
    }

    /**
     * Alterna el estado de favorito de un POI
     * @param {Object} poi - Datos del POI
     * @returns {boolean} - true si ahora es favorito, false si se eliminó
     */
    function toggleFavorite(poi) {
        if (isFavorite(poi.id)) {
            removeFavorite(poi.id);
            return false;
        } else {
            addFavorite(poi);
            return true;
        }
    }

    /**
     * Limpia todos los favoritos
     * @returns {boolean} - true si se limpiaron correctamente
     */
    function clearAllFavorites() {
        if (favorites.length === 0) {
            return false;
        }

        const count = favorites.length;
        favorites = [];
        saveToStorage();
        
        console.log(`✅ Cleared ${count} favorites`);
        return true;
    }

    /**
     * Obtiene favoritos por categoría
     * @param {string} category - Categoría a filtrar
     * @returns {Array} - Favoritos de la categoría
     */
    function getFavoritesByCategory(category) {
        if (category === 'all') {
            return [...favorites];
        }
        return favorites.filter(fav => fav.category === category);
    }

    /**
     * Busca en favoritos
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} - Favoritos que coinciden
     */
    function searchFavorites(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term.length === 0) {
            return [...favorites];
        }

        return favorites.filter(fav => {
            return fav.name.toLowerCase().includes(term) ||
                   fav.description.toLowerCase().includes(term) ||
                   fav.category.toLowerCase().includes(term);
        });
    }

    /**
     * Obtiene el conteo de favoritos
     * @returns {number} - Número de favoritos
     */
    function getFavoritesCount() {
        return favorites.length;
    }

    /**
     * Ordena favoritos por fecha de agregado
     * @param {string} order - 'asc' o 'desc'
     * @returns {Array} - Favoritos ordenados
     */
    function sortByDate(order = 'desc') {
        const sorted = [...favorites].sort((a, b) => {
            const dateA = new Date(a.addedAt);
            const dateB = new Date(b.addedAt);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return sorted;
    }

    /**
     * Ordena favoritos por nombre
     * @param {string} order - 'asc' o 'desc'
     * @returns {Array} - Favoritos ordenados
     */
    function sortByName(order = 'asc') {
        const sorted = [...favorites].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return order === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }

    /**
     * Ordena favoritos por rating
     * @param {string} order - 'asc' o 'desc'
     * @returns {Array} - Favoritos ordenados
     */
    function sortByRating(order = 'desc') {
        const sorted = [...favorites].sort((a, b) => {
            const comparison = (a.rating || 0) - (b.rating || 0);
            return order === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }

    /**
     * Exporta favoritos como JSON
     * @returns {string} - JSON string de favoritos
     */
    function exportFavorites() {
        return JSON.stringify(favorites, null, 2);
    }

    /**
     * Importa favoritos desde JSON
     * @param {string} jsonString - JSON string de favoritos
     * @returns {boolean} - true si se importaron correctamente
     */
    function importFavorites(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected array');
            }

            // Combinar con favoritos existentes (evitar duplicados)
            imported.forEach(item => {
                if (!isFavorite(item.id)) {
                    favorites.push(item);
                }
            });

            saveToStorage();
            console.log('✅ Imported', imported.length, 'favorites');
            return true;
        } catch (error) {
            console.error('Error importing favorites:', error);
            return false;
        }
    }

    /**
     * Registra un callback para cambios en favoritos
     * @param {Function} callback - Función a llamar cuando cambien los favoritos
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            changeCallbacks.push(callback);
        }
    }

    /**
     * Notifica a todos los callbacks registrados
     */
    function notifyChanges() {
        changeCallbacks.forEach(callback => {
            try {
                callback([...favorites]);
            } catch (error) {
                console.error('Error in favorites change callback:', error);
            }
        });
    }

    /**
     * Actualiza un favorito existente
     * @param {string} poiId - ID del POI
     * @param {Object} updates - Datos a actualizar
     * @returns {boolean} - true si se actualizó correctamente
     */
    function updateFavorite(poiId, updates) {
        const index = favorites.findIndex(fav => fav.id === poiId);
        
        if (index === -1) {
            console.error('Favorite not found:', poiId);
            return false;
        }

        favorites[index] = { ...favorites[index], ...updates };
        saveToStorage();
        
        console.log('✅ Favorite updated:', favorites[index].name);
        return true;
    }

    // API pública del módulo
    return {
        init,
        getAllFavorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        clearAllFavorites,
        getFavoritesByCategory,
        searchFavorites,
        getFavoritesCount,
        sortByDate,
        sortByName,
        sortByRating,
        exportFavorites,
        importFavorites,
        onChange,
        updateFavorite
    };
})();
