const CONFIG = {
    API_KEY: "a16ae8a9e473e167a27b616834d5be28",
    BEARER_TOKEN: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_URL: "https://image.tmdb.org/t/p/w400",
    DOMAIN: "https://kurbutoke.github.io/Kstream"
};

const ELEMENTS = {
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("search-results"),
    trendingItems: document.getElementById("trending-items"),
    moviesItems: document.getElementById("movies-items"),
    seriesItems: document.getElementById("series-items"),
    favoritesItems: document.getElementById("favorites-items"),
    historyItems: document.getElementById("history-items"),
    historySection: document.getElementById("history-section"),
    searchWrap: document.querySelector(".search-wrap")
};

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

function showSkeletons(container, count = 10) {
    if (!container) return;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        const posterDiv = document.createElement("div");
        posterDiv.classList.add("skeleton", "skeleton-poster");
        itemDiv.appendChild(posterDiv);
        fragment.appendChild(itemDiv);
    }
    container.appendChild(fragment);
}

function createSearchLoader() {
    const loader = document.createElement("div");
    loader.className = "search-loading";
    ELEMENTS.searchWrap.style.position = "relative";
    ELEMENTS.searchWrap.appendChild(loader);
    return loader;
}

const searchLoader = createSearchLoader();

function createMediaCard(item, type = 'movie') {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.style.cursor = "pointer";

    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || "N/A";
    const year = date.split("-")[0];
    const mediaType = item.media_type || type;

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("poster");
    const posterLink = document.createElement("div");
    const posterImg = document.createElement("img");
    posterImg.draggable = false;
    posterImg.src = item.poster_path
        ? `${CONFIG.IMAGE_URL}${item.poster_path}`
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
    metaSpan.innerHTML = `${title} (${year})`;
    metaDiv.appendChild(metaSpan);

    itemDiv.appendChild(posterDiv);
    itemDiv.appendChild(metaDiv);

    itemDiv.addEventListener("click", () => {
        window.location.href = `player.html?media=${mediaType === 'movie' ? 'movie' : 'tv'}&id=${item.id}`;
    });

    return itemDiv;
}

ELEMENTS.searchInput.addEventListener("input", debounce(async (event) => {
    const searchTerm = event.target.value.trim();
    ELEMENTS.searchResults.innerHTML = "";

    if (searchTerm.length > 0) {
        searchLoader.style.display = "block";
        ELEMENTS.searchResults.style.display = "inline";

        const data = await fetchTMDB("/search/multi", { query: searchTerm });
        searchLoader.style.display = "none";

        if (data && data.results && data.results.length > 0) {
            const fragment = document.createDocumentFragment();

            const validResults = data.results.filter(item => item.poster_path).slice(0, 5);

            validResults.forEach((item) => {
                const mediaItem = document.createElement("div");
                mediaItem.className = "item";
                mediaItem.style.cursor = "pointer";

                const poster = document.createElement("img");
                poster.src = item.poster_path ? `${CONFIG.IMAGE_URL}${item.poster_path}` : `${CONFIG.DOMAIN}/img/empty.png`;
                poster.className = "poster";

                const info = document.createElement("div");
                info.className = "info";

                const titleLink = document.createElement("a");
                titleLink.className = "name";
                titleLink.textContent = item.title || item.name;
                titleLink.href = "#";

                const meta = document.createElement("span");
                meta.className = "meta";
                const type = item.media_type === "movie" ? "Movie" : "TV";
                const year = (item.first_air_date || item.release_date || "").slice(0, 4);
                const rating = item.vote_average ? Math.round(item.vote_average * 10) : 0;
                meta.textContent = `${type} • ${year} • ${rating}%`;

                info.appendChild(titleLink);
                info.appendChild(meta);
                mediaItem.appendChild(poster);
                mediaItem.appendChild(info);

                mediaItem.addEventListener("click", () => {
                    const mediaType = item.media_type === "movie" ? "movie" : "tv";
                    window.location.href = `${CONFIG.DOMAIN}/player.html?media=${mediaType}&id=${item.id}`;
                });

                fragment.appendChild(mediaItem);
            });

            ELEMENTS.searchResults.appendChild(fragment);
        } else {
            const noResults = document.createElement("div");
            noResults.className = "no-results";
            noResults.textContent = "No results found";
            ELEMENTS.searchResults.appendChild(noResults);
        }
    } else {
        ELEMENTS.searchResults.style.display = "none";
        searchLoader.style.display = "none";
    }
}, 300));

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.updateTrending = async function (type, tab) {
    if (tab) handleTabActive(tab);

    const container = ELEMENTS.trendingItems;
    showSkeletons(container);

    let endpoint = type === 'movie' ? '/trending/movie/week' : '/trending/tv/week';
    const data = await fetchTMDB(endpoint);

    container.innerHTML = "";
    if (data && data.results) {
        const fragment = document.createDocumentFragment();
        data.results.slice(0, 10).forEach(item => {
            fragment.appendChild(createMediaCard(item, type));
        });

        if (data.total_results > 10) {
            const viewAllBtn = createViewAllButton(type, 'trending');
            fragment.appendChild(viewAllBtn);
        }

        container.appendChild(fragment);
        enableDragScroll(container);
    }
};

window.updateMovies = async function (category, tab) {
    if (tab && tab.classList.contains('active')) return;
    if (tab) handleTabActive(tab);

    const container = ELEMENTS.moviesItems;
    showSkeletons(container);

    let endpoint = '';
    let params = {};

    if (category === 'top_rated') endpoint = '/movie/top_rated';
    else if (category === 'upcoming') endpoint = '/movie/upcoming';
    else {
        endpoint = '/discover/movie';
        const genres = {
            'action': '28',
            'comedy': '35',
            'horror': '27',
            'animation': '16',
            'documentary': '99',
            'drama': '18',
            'fantasy': '14',
            'scifi': '878',
            'romance': '10749',
            'thriller': '53'
        };
        if (genres[category]) params = { with_genres: genres[category] };
    }

    const data = await fetchTMDB(endpoint, params);
    container.innerHTML = "";

    if (data && data.results) {
        const fragment = document.createDocumentFragment();
        data.results.slice(0, 20).forEach(item => {
            fragment.appendChild(createMediaCard(item, 'movie'));
        });

        const viewAllBtn = createViewAllButton('movie', category);
        fragment.appendChild(viewAllBtn);

        container.appendChild(fragment);
        enableDragScroll(container);
    }
};

window.updateSeries = async function (category, tab) {
    if (tab && tab.classList.contains('active')) return;
    if (tab) handleTabActive(tab);

    const container = ELEMENTS.seriesItems;
    showSkeletons(container);

    let endpoint = '';
    let params = {};

    if (category === 'top_rated') endpoint = '/tv/top_rated';
    else if (category === 'on_the_air') endpoint = '/tv/on_the_air';
    else {
        endpoint = '/discover/tv';
        const genres = {
            'action': '10759',
            'comedy': '35',
            'drama': '18',
            'scifi': '10765',
            'animation': '16',
            'documentary': '99',
            'mystery': '9648',
            'family': '10751',
            'reality': '10764'
        };
        if (genres[category]) params = { with_genres: genres[category] };
    }

    const data = await fetchTMDB(endpoint, params);
    container.innerHTML = "";

    if (data && data.results) {
        const fragment = document.createDocumentFragment();
        data.results.slice(0, 20).forEach(item => {
            fragment.appendChild(createMediaCard(item, 'tv'));
        });

        const viewAllBtn = createViewAllButton('tv', category);
        fragment.appendChild(viewAllBtn);

        container.appendChild(fragment);
        enableDragScroll(container);
    }
};

function createViewAllButton(type, category) {
    const div = document.createElement('div');
    div.className = 'item view-all-card';
    div.title = "View All in this category";
    div.innerHTML = `
        <div class="view-all-content">
            <i class="bi bi-arrow-right"></i>
        </div>
    `;
    div.onclick = () => {
        window.location.href = `browse.html?type=${type}&category=${category}`;
    };
    return div;
}

function handleTabActive(tab) {
    const siblings = tab.parentNode.children;
    for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove('active');
    }
    tab.classList.add('active');
}

window.toggleHistory = function () {
    const section = document.getElementById('history-section');
    section.classList.toggle('open');
};

window.clearHistory = function (event) {
    if (event) event.stopPropagation();
    if (confirm("Are you sure you want to clear your watch history?")) {
        localStorage.removeItem('watchHistory');
        updateHistory();
    }
};

function updateHistory() {
    const history = JSON.parse(localStorage.getItem('watchHistory')) || [];

    if (history.length === 0) {
        ELEMENTS.historySection.style.display = 'none';
        return;
    }

    ELEMENTS.historySection.style.display = 'block';

    ELEMENTS.historyItems.innerHTML = "";
    const fragment = document.createDocumentFragment();

    history.forEach(item => {
        const card = createMediaCard(item, item.media);

        card.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let url = `player.html?media=${item.media}&id=${item.id}`;
            if (item.media === 'tv' && item.season && item.episode) {
                url += `&season=${item.season}&episode=${item.episode}`;
            }
            window.location.href = url;
        };

        if (item.media === 'tv' && item.infoStr) {
            const metaSpan = card.querySelector('.meta span');
            if (metaSpan) {
                metaSpan.innerHTML += ` • <span style="color:var(--primary-color)">${item.infoStr}</span>`;
            }
        }

        if (item.media === 'movie' && item.currentTime) {
            const metaSpan = card.querySelector('.meta span');
            if (metaSpan) {
                const timeText = formatTime(item.currentTime);
                metaSpan.innerHTML += ` • <span style="color:var(--primary-color)">${timeText}</span>`;
            }
        }

        fragment.appendChild(card);
    });

    ELEMENTS.historyItems.appendChild(fragment);
    enableDragScroll(ELEMENTS.historyItems);
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
}

window.toggleFavorites = function () {
    const section = document.getElementById('favorites-section');
    section.classList.toggle('open');
};

window.updateFavorites = async function (filter = 'all', tab = null) {
    if (tab) {
        event && event.stopPropagation();
        handleTabActive(tab);
    }

    const favoritesData = localStorage.getItem('favorites');
    const favorites = favoritesData ? JSON.parse(favoritesData) : [];

    const filteredFavorites = filter === 'all'
        ? favorites
        : favorites.filter(item => item.media === filter);

    const container = ELEMENTS.favoritesItems;

    if (!filteredFavorites.length) {
        ELEMENTS.favoritesItems.parentElement.style.display = 'none';
        return;
    }
    ELEMENTS.favoritesItems.parentElement.style.display = 'block';

    showSkeletons(container, filteredFavorites.length);

    const fragment = document.createDocumentFragment();

    const promises = filteredFavorites.map(favorite =>
        fetchTMDB(`/${favorite.media}/${favorite.id}`, { append_to_response: "credits" })
            .then(data => data ? createMediaCard(data, favorite.media) : null)
    );

    const results = await Promise.all(promises);
    container.innerHTML = "";

    results.forEach(card => {
        if (card) fragment.appendChild(card);
    });

    container.appendChild(fragment);
    enableDragScroll(container);
};

function enableDragScroll(container) {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
        if (isDragging) {
            const items = container.querySelectorAll('.item');
            items.forEach(item => item.style.pointerEvents = 'none');
            setTimeout(() => {
                items.forEach(item => item.style.pointerEvents = 'auto');
            }, 100);
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) isDragging = true;
        container.scrollLeft = scrollLeft - walk;
    });

    container.style.cursor = 'grab';
}

window.addEventListener("load", () => {
    updateTrending('movie');
    updateMovies('top_rated');
    updateSeries('top_rated');
    updateFavorites('all');
    updateHistory();
});