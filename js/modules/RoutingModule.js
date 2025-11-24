// ====================================
// RoutingModule.js
// Gestiona las rutas de navegación dentro de la app
// ====================================

export const RoutingModule = (() => {
    let routes = {};
    let currentRoute = 'home';
    let history = ['home'];
    let callbacks = {};

    /**
     * Inicializa el módulo de routing
     */
    function init() {
        setupDefaultRoutes();
        setupNavigationListeners();
        console.log('✅ RoutingModule initialized');
    }

    /**
     * Configura las rutas por defecto
     */
    function setupDefaultRoutes() {
        routes = {
            'home': {
                path: '#home',
                title: 'Home - Explore the City',
                handler: null
            },
            'favorites': {
                path: '#favorites',
                title: 'Favorites - Explore the City',
                handler: null
            },
            'events': {
                path: '#events',
                title: 'Events - Explore the City',
                handler: null
            },
            'routes': {
                path: '#routes',
                title: 'Routes - Explore the City',
                handler: null
            },
            'about': {
                path: '#about',
                title: 'About - Explore the City',
                handler: null
            },
            'contact': {
                path: '#contact',
                title: 'Contact - Explore the City',
                handler: null
            }
        };
    }

    /**
     * Configura listeners de navegación
     */
    function setupNavigationListeners() {
        // Escuchar cambios en el hash de la URL
        window.addEventListener('hashchange', handleHashChange);
        
        // Cargar ruta inicial
        handleHashChange();
    }

    /**
     * Maneja cambios en el hash de la URL
     */
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        navigateTo(hash, false);
    }

    /**
     * Navega a una ruta específica
     * @param {string} routeName - Nombre de la ruta
     * @param {boolean} updateURL - Si actualizar la URL
     * @param {Object} data - Datos adicionales para la ruta
     */
    function navigateTo(routeName, updateURL = true, data = null) {
        const route = routes[routeName];
        
        if (!route) {
            console.warn(`Route "${routeName}" not found. Redirecting to home.`);
            navigateTo('home', updateURL);
            return;
        }

        // Actualizar URL si es necesario
        if (updateURL && route.path) {
            window.location.hash = route.path;
        }

        // Actualizar título de la página
        if (route.title) {
            document.title = route.title;
        }

        // Agregar al historial
        if (currentRoute !== routeName) {
            history.push(routeName);
            if (history.length > 50) {
                history.shift();
            }
        }

        currentRoute = routeName;

        // Ejecutar handler de la ruta si existe
        if (route.handler && typeof route.handler === 'function') {
            route.handler(data);
        }

        // Ejecutar callbacks registrados
        executeCallbacks(routeName, data);

        console.log(`Navigated to: ${routeName}`);
    }

    /**
     * Registra una nueva ruta
     * @param {string} name - Nombre de la ruta
     * @param {Object} config - Configuración de la ruta
     */
    function registerRoute(name, config) {
        routes[name] = {
            path: config.path || `#${name}`,
            title: config.title || `${name} - Explore the City`,
            handler: config.handler || null
        };
        
        console.log(`Route registered: ${name}`);
    }

    /**
     * Elimina una ruta registrada
     * @param {string} name - Nombre de la ruta
     */
    function unregisterRoute(name) {
        if (routes[name]) {
            delete routes[name];
            console.log(`Route unregistered: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Registra un callback para una ruta
     * @param {string} routeName - Nombre de la ruta
     * @param {Function} callback - Función a ejecutar
     */
    function onRoute(routeName, callback) {
        if (!callbacks[routeName]) {
            callbacks[routeName] = [];
        }
        callbacks[routeName].push(callback);
    }

    /**
     * Ejecuta callbacks registrados para una ruta
     * @param {string} routeName - Nombre de la ruta
     * @param {Object} data - Datos para los callbacks
     */
    function executeCallbacks(routeName, data) {
        if (callbacks[routeName]) {
            callbacks[routeName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in route callback for "${routeName}":`, error);
                }
            });
        }
    }

    /**
     * Vuelve a la ruta anterior
     */
    function goBack() {
        if (history.length > 1) {
            history.pop(); // Eliminar ruta actual
            const previousRoute = history[history.length - 1];
            navigateTo(previousRoute, true);
        } else {
            navigateTo('home', true);
        }
    }

    /**
     * Va a la página de inicio
     */
    function goHome() {
        navigateTo('home', true);
    }

    /**
     * Obtiene la ruta actual
     * @returns {string} - Nombre de la ruta actual
     */
    function getCurrentRoute() {
        return currentRoute;
    }

    /**
     * Obtiene el historial de navegación
     * @returns {Array} - Array con el historial
     */
    function getHistory() {
        return [...history];
    }

    /**
     * Limpia el historial de navegación
     */
    function clearHistory() {
        history = [currentRoute];
        console.log('Navigation history cleared');
    }

    /**
     * Verifica si una ruta existe
     * @param {string} routeName - Nombre de la ruta
     * @returns {boolean} - true si existe
     */
    function routeExists(routeName) {
        return routes.hasOwnProperty(routeName);
    }

    /**
     * Obtiene información de una ruta
     * @param {string} routeName - Nombre de la ruta
     * @returns {Object|null} - Información de la ruta
     */
    function getRouteInfo(routeName) {
        return routes[routeName] || null;
    }

    /**
     * Obtiene todas las rutas registradas
     * @returns {Object} - Objeto con todas las rutas
     */
    function getAllRoutes() {
        return { ...routes };
    }

    /**
     * Establece el handler de una ruta
     * @param {string} routeName - Nombre de la ruta
     * @param {Function} handler - Función handler
     */
    function setRouteHandler(routeName, handler) {
        if (routes[routeName]) {
            routes[routeName].handler = handler;
            console.log(`Handler set for route: ${routeName}`);
            return true;
        }
        console.warn(`Route "${routeName}" not found`);
        return false;
    }

    /**
     * Navega con parámetros de consulta
     * @param {string} routeName - Nombre de la ruta
     * @param {Object} params - Parámetros de consulta
     */
    function navigateWithParams(routeName, params) {
        const route = routes[routeName];
        
        if (!route) {
            console.warn(`Route "${routeName}" not found`);
            return;
        }

        let url = route.path;
        if (params && Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            url += `?${queryString}`;
        }

        window.location.hash = url;
    }

    /**
     * Obtiene parámetros de la URL actual
     * @returns {Object} - Objeto con los parámetros
     */
    function getQueryParams() {
        const hash = window.location.hash;
        const queryIndex = hash.indexOf('?');
        
        if (queryIndex === -1) {
            return {};
        }

        const queryString = hash.substring(queryIndex + 1);
        const params = {};

        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });

        return params;
    }

    /**
     * Redirige a una ruta externa
     * @param {string} url - URL externa
     * @param {boolean} newTab - Si abrir en nueva pestaña
     */
    function redirectExternal(url, newTab = false) {
        if (newTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    // API pública del módulo
    return {
        init,
        navigateTo,
        registerRoute,
        unregisterRoute,
        onRoute,
        goBack,
        goHome,
        getCurrentRoute,
        getHistory,
        clearHistory,
        routeExists,
        getRouteInfo,
        getAllRoutes,
        setRouteHandler,
        navigateWithParams,
        getQueryParams,
        redirectExternal
    };
})();
