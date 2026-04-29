const CONFIG = window.KSTREAM_CONFIG || {
    API_KEY: "",
    BEARER_TOKEN: "",
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_URL: "https://image.tmdb.org/t/p/w400",
    DOMAIN: ""
};

const UTILS = window.KSTREAM_UTILS || {};

const UI = {
    items: document.getElementById("browse-items"),
    title: document.getElementById("page-title"),
    loadMoreBtn: document.getElementById("load-more-btn")
};

let currentPage = 1;
let currentType = 'movie';
let currentCategory = 'popular';
let currentQuery = '';
let isLoading = false;

async function fetchTMDB(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", CONFIG.API_KEY);
    url.searchParams.append("language", "en-US");

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    const headers = { Authorization: `Bearer ${CONFIG.BEARER_TOKEN}` };

    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawType = urlParams.get('type') || 'movie';
    currentType = rawType === 'tv' ? 'tv' : 'movie';
    currentCategory = urlParams.get('category') || 'popular';
    currentQuery = UTILS.normalizeInput ? UTILS.normalizeInput(urlParams.get('query') || '', 60) : (urlParams.get('query') || '');

    const typeTitle = currentType === 'movie' ? 'Movies' : 'TV Series';
    let categoryTitle = currentCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (currentCategory === 'search' && currentQuery) {
        categoryTitle = `Search: "${currentQuery}"`;
    }

    UI.title.textContent = `${categoryTitle} ${typeTitle}`;
    document.title = `${UI.title.textContent} - Kstream`;

    loadContent();
}

async function loadContent() {
    if (isLoading) return;
    isLoading = true;
    UI.loadMoreBtn.textContent = "Loading...";

    let endpoint = '';
    let params = { page: currentPage };

    if (currentCategory === 'search' && !currentQuery) {
        UI.items.innerHTML = "<div class='no-results'>Type a search on the homepage to begin.</div>";
        UI.loadMoreBtn.style.display = "none";
        isLoading = false;
        return;
    }

    if (currentCategory === 'search' && currentQuery) {
        endpoint = `/search/${currentType}`;
        params.query = currentQuery;
    } else if (currentCategory === 'trending') {
        endpoint = `/trending/${currentType}/week`;
    } else if (currentCategory === 'top_rated') {
        endpoint = `/${currentType}/top_rated`;
    } else if (currentCategory === 'upcoming' && currentType === 'movie') {
        endpoint = '/movie/upcoming';
    } else if (currentCategory === 'on_the_air' && currentType === 'tv') {
        endpoint = '/tv/on_the_air';
    } else {
        if (!isNaN(currentCategory)) {
            endpoint = `/discover/${currentType}`;
            params.with_genres = currentCategory;

            const urlParams = new URLSearchParams(window.location.search);
            const titleParam = urlParams.get('title');
            if (titleParam) {
                UI.title.textContent = `${decodeURIComponent(titleParam)} ${currentType === 'movie' ? 'Movies' : 'TV Series'}`;
                document.title = `${UI.title.textContent} - Kstream`;
            }
        } else {
            endpoint = `/discover/${currentType}`;
            const genres = {
                'action': currentType === 'movie' ? '28' : '10759',
                'comedy': '35',
                'horror': '27',
                'animation': '16',
                'documentary': '99',
                'drama': '18',
                'scifi': currentType === 'movie' ? '878' : '10765',
                'fantasy': '14',
                'romance': '10749',
                'thriller': '53',
                'mystery': '9648',
                'family': '10751',
                'crime': '80',
                'adventure': '12'
            };

            if (genres[currentCategory]) {
                params.with_genres = genres[currentCategory];
            } else {
                endpoint = `/${currentType}/popular`;
            }
        }
    }

    const data = await fetchTMDB(endpoint, params);
    isLoading = false;
    UI.loadMoreBtn.textContent = "Load More";

    if (data && data.results) {
        const fragment = document.createDocumentFragment();
        data.results.forEach(item => {
            fragment.appendChild(createMediaCard(item, currentType));
        });
        UI.items.appendChild(fragment);
        currentPage++;

        if (currentPage > data.total_pages) {
            UI.loadMoreBtn.style.display = "none";
        }
    } else {
        UI.loadMoreBtn.style.display = "none";
    }
}

UI.loadMoreBtn.addEventListener("click", loadContent);

function createMediaCard(item, type = 'movie') {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.style.cursor = "pointer";
    itemDiv.style.marginBottom = "20px";

    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || "N/A";
    const year = date.split("-")[0];
    const mediaType = item.media_type || type;

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("poster");
    const posterLink = document.createElement("div");
    const posterImg = document.createElement("img");
    posterImg.draggable = false;
    posterImg.decoding = "async";
    posterImg.src = item.poster_path
        ? `${CONFIG.IMAGE_URL}/w400${item.poster_path}`
        : `${CONFIG.DOMAIN}/img/empty.png`;
    posterImg.alt = title;
    posterImg.loading = "lazy";

    posterImg.style.opacity = "0";
    posterImg.style.transition = "opacity 0.3s";
    posterImg.onload = () => posterImg.style.opacity = "1";

    posterLink.appendChild(posterImg);
    posterDiv.appendChild(posterLink);

    const metaDiv = document.createElement("div");
    metaDiv.classList.add("meta");
    const metaSpan = document.createElement("span");
    metaSpan.textContent = `${title} (${year})`;
    metaDiv.appendChild(metaSpan);

    itemDiv.appendChild(posterDiv);
    itemDiv.appendChild(metaDiv);

    itemDiv.addEventListener("click", () => {
        window.location.href = `player.html?media=${mediaType}&id=${item.id}`;
    });

    return itemDiv;
}

window.addEventListener('load', getURLParameters);