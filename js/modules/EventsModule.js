// ====================================
// EventsModule.js
// Conexión con la API externa de eventos
// ====================================

export const EventsModule = (() => {
    let events = [];
    let isLoading = false;

    // Datos temporales de eventos (serán reemplazados por API de Eventbrite o similar)
    const sampleEvents = [
        {
            id: 'event-1',
            name: 'Fiestas de Moros y Cristianos',
            description: 'Celebración tradicional con desfiles, música y actividades culturales.',
            date: '2025-05-15',
            time: '10:00 AM - 8:00 PM',
            location: 'Centro de Petrer',
            coordinates: { lat: 38.4836, lng: -0.7768 },
            category: 'cultural',
            image: 'images/event1.jpg',
            url: null,
            organizer: 'Ayuntamiento de Petrer'
        },
        {
            id: 'event-2',
            name: 'Mercado Medieval',
            description: 'Mercado tradicional con artesanía, comida típica y espectáculos.',
            date: '2025-05-22',
            time: '9:00 AM - 6:00 PM',
            location: 'Castillo de Petrer',
            coordinates: { lat: 38.4845, lng: -0.7765 },
            category: 'fair',
            image: 'images/event2.jpg',
            url: null,
            organizer: 'Asociación Cultural'
        },
        {
            id: 'event-3',
            name: 'Concierto de Verano',
            description: 'Concierto al aire libre con bandas locales e internacionales.',
            date: '2025-06-05',
            time: '7:00 PM',
            location: 'Plaza Mayor',
            coordinates: { lat: 38.4830, lng: -0.7775 },
            category: 'music',
            image: 'images/event3.jpg',
            url: null,
            organizer: 'Concejalía de Cultura'
        }
    ];

    /**
     * Inicializa el módulo de eventos
     */
    function init() {
        events = [...sampleEvents];
        console.log('✅ EventsModule initialized with', events.length, 'events');
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
     * Obtiene eventos próximos
     * @param {number} daysAhead - Número de días hacia adelante
     * @returns {Array} - Eventos próximos
     */
    function getUpcomingEvents(daysAhead = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= futureDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Obtiene eventos pasados
     * @returns {Array} - Eventos pasados
     */
    function getPastEvents() {
        const today = new Date();
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate < today;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
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
                   event.category.toLowerCase().includes(term);
        });
    }

    /**
     * Formatea la fecha del evento
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} - Fecha formateada
     */
    function formatEventDate(dateString) {
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
     * Obtiene el estado del evento (próximo, hoy, pasado)
     * @param {string} dateString - Fecha del evento
     * @returns {string} - Estado del evento
     */
    function getEventStatus(dateString) {
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
     * Carga eventos desde una API externa (placeholder)
     * @param {string} apiUrl - URL de la API
     * @returns {Promise} - Promesa con los eventos
     */
    async function fetchEventsFromAPI(apiUrl) {
        isLoading = true;
        console.log('Fetching events from API:', apiUrl);

        try {
            // TODO: Implementar llamada real a la API
            // const response = await fetch(apiUrl);
            // const data = await response.json();
            // events = processAPIData(data);
            
            // Simulación de carga
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('✅ Events loaded from API');
            isLoading = false;
            return [...events];
        } catch (error) {
            console.error('❌ Error fetching events:', error);
            isLoading = false;
            throw error;
        }
    }

    /**
     * Agrega un evento a la lista
     * @param {Object} event - Datos del evento
     * @returns {Object} - Evento agregado
     */
    function addEvent(event) {
        const newEvent = {
            id: `event-${Date.now()}`,
            ...event
        };

        events.push(newEvent);
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('Event added:', newEvent.name);
        return newEvent;
    }

    /**
     * Actualiza un evento existente
     * @param {string} id - ID del evento
     * @param {Object} updates - Datos a actualizar
     * @returns {Object|null} - Evento actualizado o null
     */
    function updateEvent(id, updates) {
        const index = events.findIndex(event => event.id === id);
        
        if (index === -1) {
            console.error('Event not found:', id);
            return null;
        }

        events[index] = { ...events[index], ...updates };
        console.log('Event updated:', events[index].name);
        return events[index];
    }

    /**
     * Elimina un evento
     * @param {string} id - ID del evento
     * @returns {boolean} - true si se eliminó correctamente
     */
    function deleteEvent(id) {
        const index = events.findIndex(event => event.id === id);
        
        if (index === -1) {
            console.error('Event not found:', id);
            return false;
        }

        const deleted = events.splice(index, 1)[0];
        console.log('Event deleted:', deleted.name);
        return true;
    }

    /**
     * Verifica si el módulo está cargando datos
     * @returns {boolean} - true si está cargando
     */
    function getLoadingState() {
        return isLoading;
    }

    // API pública del módulo
    return {
        init,
        getAllEvents,
        getEventById,
        filterByCategory,
        getUpcomingEvents,
        getPastEvents,
        searchEvents,
        formatEventDate,
        getEventStatus,
        getStatusText,
        fetchEventsFromAPI,
        addEvent,
        updateEvent,
        deleteEvent,
        getLoadingState
    };
})();
