// ====================================
// WikipediaModule.js
// Obtiene información de lugares desde Wikipedia API
// ====================================

export const WikipediaModule = (() => {
    const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
    const cache = new Map(); // Caché en memoria para evitar búsquedas repetidas

    /**
     * Busca información de un lugar en Wikipedia
     * @param {string} placeName - Nombre del lugar
     * @param {string} city - Ciudad (opcional, mejora la búsqueda)
     * @returns {Promise<Object|null>} - Información del lugar o null
     */
    async function searchPlace(placeName, city = '') {
        const searchQuery = city ? `${placeName} ${city}` : placeName;
        const cacheKey = searchQuery.toLowerCase();

        // Verificar caché
        if (cache.has(cacheKey)) {
            console.log('📚 Wikipedia info from cache:', searchQuery);
            return cache.get(cacheKey);
        }

        try {
            console.log('🔍 Searching Wikipedia for:', searchQuery);

            // Primero, buscar el artículo más relevante
            const searchUrl = `${WIKIPEDIA_API}?` + new URLSearchParams({
                action: 'opensearch',
                search: searchQuery,
                limit: '1',
                format: 'json',
                origin: '*'
            });

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchData[1] || searchData[1].length === 0) {
                console.log('❌ No Wikipedia article found for:', searchQuery);
                cache.set(cacheKey, null);
                return null;
            }

            const articleTitle = searchData[1][0];
            const articleUrl = searchData[3][0];

            // Obtener el extracto del artículo
            const extractUrl = `${WIKIPEDIA_API}?` + new URLSearchParams({
                action: 'query',
                prop: 'extracts|pageimages|info',
                exintro: 'true',
                explaintext: 'true',
                exsentences: '5',
                piprop: 'thumbnail',
                pithumbsize: '500',
                inprop: 'url',
                titles: articleTitle,
                format: 'json',
                origin: '*'
            });

            const extractResponse = await fetch(extractUrl);
            const extractData = await extractResponse.json();

            const pages = extractData.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];

            if (!page || !page.extract) {
                console.log('❌ No extract found for:', articleTitle);
                cache.set(cacheKey, null);
                return null;
            }

            const result = {
                title: page.title,
                extract: page.extract,
                url: page.fullurl || articleUrl,
                thumbnail: page.thumbnail ? page.thumbnail.source : null,
                source: 'Wikipedia'
            };

            console.log('✅ Wikipedia info found:', result.title);
            cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error('❌ Error fetching Wikipedia data:', error);
            cache.set(cacheKey, null);
            return null;
        }
    }

    /**
     * Busca información específicamente en un idioma
     * @param {string} placeName - Nombre del lugar
     * @param {string} lang - Código de idioma (es, en, fr, etc.)
     * @param {string} city - Ciudad (opcional)
     * @returns {Promise<Object|null>} - Información del lugar o null
     */
    async function searchPlaceInLanguage(placeName, lang = 'en', city = '') {
        const wikiApiUrl = `https://${lang}.wikipedia.org/w/api.php`;
        const searchQuery = city ? `${placeName} ${city}` : placeName;
        const cacheKey = `${lang}:${searchQuery.toLowerCase()}`;

        // Verificar caché
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            // Buscar artículo
            const searchUrl = `${wikiApiUrl}?` + new URLSearchParams({
                action: 'opensearch',
                search: searchQuery,
                limit: '1',
                format: 'json',
                origin: '*'
            });

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchData[1] || searchData[1].length === 0) {
                cache.set(cacheKey, null);
                return null;
            }

            const articleTitle = searchData[1][0];
            const articleUrl = searchData[3][0];

            // Obtener extracto
            const extractUrl = `${wikiApiUrl}?` + new URLSearchParams({
                action: 'query',
                prop: 'extracts|pageimages|info',
                exintro: 'true',
                explaintext: 'true',
                exsentences: '5',
                piprop: 'thumbnail',
                pithumbsize: '500',
                inprop: 'url',
                titles: articleTitle,
                format: 'json',
                origin: '*'
            });

            const extractResponse = await fetch(extractUrl);
            const extractData = await extractResponse.json();

            const pages = extractData.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];

            if (!page || !page.extract) {
                cache.set(cacheKey, null);
                return null;
            }

            const result = {
                title: page.title,
                extract: page.extract,
                url: page.fullurl || articleUrl,
                thumbnail: page.thumbnail ? page.thumbnail.source : null,
                source: `Wikipedia (${lang.toUpperCase()})`,
                language: lang
            };

            cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error(`Error fetching Wikipedia (${lang}):`, error);
            cache.set(cacheKey, null);
            return null;
        }
    }

    /**
     * Busca en múltiples idiomas (inglés y español)
     * @param {string} placeName - Nombre del lugar
     * @param {string} city - Ciudad (opcional)
     * @returns {Promise<Object|null>} - Primera información encontrada
     */
    async function searchMultiLanguage(placeName, city = '') {
        // Intentar primero en inglés
        let result = await searchPlaceInLanguage(placeName, 'en', city);
        
        if (result) {
            return result;
        }

        // Si no hay resultados, intentar en español
        result = await searchPlaceInLanguage(placeName, 'es', city);
        
        return result;
    }

    /**
     * Limpia el caché
     */
    function clearCache() {
        cache.clear();
        console.log('🗑️ Wikipedia cache cleared');
    }

    /**
     * Obtiene el tamaño del caché
     * @returns {number} - Número de entradas en caché
     */
    function getCacheSize() {
        return cache.size;
    }

    // API pública del módulo
    return {
        searchPlace,
        searchPlaceInLanguage,
        searchMultiLanguage,
        clearCache,
        getCacheSize
    };
})();
