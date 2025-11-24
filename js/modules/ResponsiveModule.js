// ====================================
// ResponsiveModule.js
// Ajusta la UI según móvil/escritorio
// ====================================

export const ResponsiveModule = (() => {
    let currentBreakpoint = 'desktop';
    let breakpoints = {};
    let resizeCallbacks = [];
    let orientationCallbacks = [];
    let resizeTimeout = null;

    /**
     * Inicializa el módulo responsive
     */
    function init() {
        setupBreakpoints();
        detectBreakpoint();
        setupEventListeners();
        console.log('✅ ResponsiveModule initialized');
        console.log('Current breakpoint:', currentBreakpoint);
    }

    /**
     * Configura los breakpoints
     */
    function setupBreakpoints() {
        breakpoints = {
            'mobile-small': { max: 374 },
            'mobile': { min: 375, max: 767 },
            'tablet': { min: 768, max: 1023 },
            'desktop': { min: 1024, max: 1439 },
            'desktop-large': { min: 1440 }
        };
    }

    /**
     * Detecta el breakpoint actual
     */
    function detectBreakpoint() {
        const width = window.innerWidth;
        let newBreakpoint = 'desktop';

        for (const [name, range] of Object.entries(breakpoints)) {
            const minMatch = !range.min || width >= range.min;
            const maxMatch = !range.max || width <= range.max;
            
            if (minMatch && maxMatch) {
                newBreakpoint = name;
                break;
            }
        }

        if (newBreakpoint !== currentBreakpoint) {
            const oldBreakpoint = currentBreakpoint;
            currentBreakpoint = newBreakpoint;
            onBreakpointChange(oldBreakpoint, newBreakpoint);
        }

        return currentBreakpoint;
    }

    /**
     * Configura event listeners
     */
    function setupEventListeners() {
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
    }

    /**
     * Maneja el evento de resize con debounce
     */
    function handleResize() {
        // Debounce para evitar múltiples llamadas
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
            detectBreakpoint();
            executeResizeCallbacks();
        }, 150);
    }

    /**
     * Maneja cambios de orientación
     */
    function handleOrientationChange() {
        setTimeout(() => {
            detectBreakpoint();
            executeOrientationCallbacks();
        }, 100);
    }

    /**
     * Ejecuta cuando cambia el breakpoint
     * @param {string} oldBreakpoint - Breakpoint anterior
     * @param {string} newBreakpoint - Nuevo breakpoint
     */
    function onBreakpointChange(oldBreakpoint, newBreakpoint) {
        console.log(`Breakpoint changed: ${oldBreakpoint} → ${newBreakpoint}`);
        
        // Aplicar clases al body
        document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
        document.body.classList.add(`breakpoint-${newBreakpoint}`);
        
        // Aplicar ajustes específicos
        applyBreakpointStyles(newBreakpoint);
    }

    /**
     * Aplica estilos específicos según breakpoint
     * @param {string} breakpoint - Breakpoint actual
     */
    function applyBreakpointStyles(breakpoint) {
        const isMobile = ['mobile-small', 'mobile'].includes(breakpoint);
        const isTablet = breakpoint === 'tablet';
        const isDesktop = ['desktop', 'desktop-large'].includes(breakpoint);

        document.body.classList.toggle('is-mobile', isMobile);
        document.body.classList.toggle('is-tablet', isTablet);
        document.body.classList.toggle('is-desktop', isDesktop);
    }

    /**
     * Registra un callback para cambios de tamaño
     * @param {Function} callback - Función a ejecutar
     */
    function onResize(callback) {
        if (typeof callback === 'function') {
            resizeCallbacks.push(callback);
        }
    }

    /**
     * Registra un callback para cambios de orientación
     * @param {Function} callback - Función a ejecutar
     */
    function onOrientationChange(callback) {
        if (typeof callback === 'function') {
            orientationCallbacks.push(callback);
        }
    }

    /**
     * Ejecuta todos los callbacks de resize
     */
    function executeResizeCallbacks() {
        const dimensions = getWindowDimensions();
        resizeCallbacks.forEach(callback => {
            try {
                callback(dimensions, currentBreakpoint);
            } catch (error) {
                console.error('Error in resize callback:', error);
            }
        });
    }

    /**
     * Ejecuta todos los callbacks de orientación
     */
    function executeOrientationCallbacks() {
        const orientation = getOrientation();
        orientationCallbacks.forEach(callback => {
            try {
                callback(orientation);
            } catch (error) {
                console.error('Error in orientation callback:', error);
            }
        });
    }

    /**
     * Obtiene las dimensiones de la ventana
     * @returns {Object} - Objeto con width y height
     */
    function getWindowDimensions() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight
        };
    }

    /**
     * Obtiene el breakpoint actual
     * @returns {string} - Nombre del breakpoint
     */
    function getCurrentBreakpoint() {
        return currentBreakpoint;
    }

    /**
     * Verifica si estamos en móvil
     * @returns {boolean} - true si es móvil
     */
    function isMobile() {
        return ['mobile-small', 'mobile'].includes(currentBreakpoint);
    }

    /**
     * Verifica si estamos en tablet
     * @returns {boolean} - true si es tablet
     */
    function isTablet() {
        return currentBreakpoint === 'tablet';
    }

    /**
     * Verifica si estamos en desktop
     * @returns {boolean} - true si es desktop
     */
    function isDesktop() {
        return ['desktop', 'desktop-large'].includes(currentBreakpoint);
    }

    /**
     * Verifica si estamos en un dispositivo táctil
     * @returns {boolean} - true si es táctil
     */
    function isTouchDevice() {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    }

    /**
     * Obtiene la orientación del dispositivo
     * @returns {string} - 'portrait' o 'landscape'
     */
    function getOrientation() {
        if (window.matchMedia('(orientation: portrait)').matches) {
            return 'portrait';
        }
        return 'landscape';
    }

    /**
     * Verifica si el viewport cumple con una media query
     * @param {string} query - Media query
     * @returns {boolean} - true si cumple
     */
    function matchesMediaQuery(query) {
        return window.matchMedia(query).matches;
    }

    /**
     * Obtiene el ancho del scrollbar
     * @returns {number} - Ancho en píxeles
     */
    function getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    /**
     * Obtiene información del dispositivo
     * @returns {Object} - Información del dispositivo
     */
    function getDeviceInfo() {
        return {
            breakpoint: currentBreakpoint,
            isMobile: isMobile(),
            isTablet: isTablet(),
            isDesktop: isDesktop(),
            isTouchDevice: isTouchDevice(),
            orientation: getOrientation(),
            dimensions: getWindowDimensions(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
    }

    /**
     * Fuerza una re-detección del breakpoint
     */
    function refresh() {
        detectBreakpoint();
        executeResizeCallbacks();
        console.log('ResponsiveModule refreshed');
    }

    /**
     * Registra un breakpoint personalizado
     * @param {string} name - Nombre del breakpoint
     * @param {Object} range - Rango min/max
     */
    function registerBreakpoint(name, range) {
        breakpoints[name] = range;
        detectBreakpoint();
        console.log(`Custom breakpoint registered: ${name}`);
    }

    /**
     * Obtiene todos los breakpoints
     * @returns {Object} - Objeto con todos los breakpoints
     */
    function getAllBreakpoints() {
        return { ...breakpoints };
    }

    /**
     * Optimiza imágenes según el dispositivo
     * @param {string} imagePath - Ruta de la imagen
     * @returns {string} - Ruta optimizada
     */
    function getOptimizedImagePath(imagePath) {
        const isRetina = window.devicePixelRatio > 1;
        const size = isMobile() ? 'small' : isTablet() ? 'medium' : 'large';
        
        // TODO: Implementar lógica de optimización real
        return imagePath;
    }

    // API pública del módulo
    return {
        init,
        getCurrentBreakpoint,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        getOrientation,
        getWindowDimensions,
        matchesMediaQuery,
        getScrollbarWidth,
        getDeviceInfo,
        onResize,
        onOrientationChange,
        refresh,
        registerBreakpoint,
        getAllBreakpoints,
        getOptimizedImagePath
    };
})();
