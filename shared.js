/* =====================================================
   KSTREAM — Shared Module
   Centralized config, API, UI helpers, and toast system
   ===================================================== */

const CONFIG = {
    API_KEY: "a16ae8a9e473e167a27b616834d5be28",
    BEARER_TOKEN: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_URL: "https://image.tmdb.org/t/p",
    IMAGE_SM: "https://image.tmdb.org/t/p/w300",
    IMAGE_MD: "https://image.tmdb.org/t/p/w342",
    IMAGE_LG: "https://image.tmdb.org/t/p/original",
    DOMAIN: "https://kurbutoke.github.io/Kstream"
};

/* ---------- Genre Data (single source of truth) ---------- */
const GENRE_IDS = {
    movie: {
        action: '28', adventure: '12', animation: '16', comedy: '35',
        crime: '80', documentary: '99', drama: '18', fantasy: '14',
        horror: '27', mystery: '9648', romance: '10749', scifi: '878',
        thriller: '53', family: '10751'
    },
    tv: {
        action: '10759', animation: '16', comedy: '35', crime: '80',
        documentary: '99', drama: '18', family: '10751', mystery: '9648',
        reality: '10764', scifi: '10765', thriller: '53', adventure: '12'
    }
};

const GENRE_LIST = {
    movie: [
        { id: '28',    name: 'Action',      icon: 'bi-fire' },
        { id: '12',    name: 'Adventure',   icon: 'bi-compass' },
        { id: '16',    name: 'Animation',   icon: 'bi-emoji-smile' },
        { id: '35',    name: 'Comedy',      icon: 'bi-emoji-laughing' },
        { id: '80',    name: 'Crime',       icon: 'bi-fingerprint' },
        { id: '99',    name: 'Documentary', icon: 'bi-camera-reels' },
        { id: '18',    name: 'Drama',       icon: 'bi-mask' },
        { id: '10751', name: 'Family',      icon: 'bi-people' },
        { id: '14',    name: 'Fantasy',     icon: 'bi-magic' },
        { id: '36',    name: 'History',     icon: 'bi-hourglass-split' },
        { id: '27',    name: 'Horror',      icon: 'bi-emoji-dizzy-fill' },
        { id: '10402', name: 'Music',       icon: 'bi-music-note-beamed' },
        { id: '9648',  name: 'Mystery',     icon: 'bi-question-circle' },
        { id: '10749', name: 'Romance',     icon: 'bi-heart-fill' },
        { id: '878',   name: 'Sci-Fi',      icon: 'bi-rocket-takeoff' },
        { id: '53',    name: 'Thriller',    icon: 'bi-eye' },
        { id: '10752', name: 'War',         icon: 'bi-shield-shaded' },
        { id: '37',    name: 'Western',     icon: 'bi-star' }
    ],
    tv: [
        { id: '10759', name: 'Action & Adventure', icon: 'bi-fire' },
        { id: '16',    name: 'Animation',          icon: 'bi-emoji-smile' },
        { id: '35',    name: 'Comedy',             icon: 'bi-emoji-laughing' },
        { id: '80',    name: 'Crime',              icon: 'bi-fingerprint' },
        { id: '99',    name: 'Documentary',        icon: 'bi-camera-reels' },
        { id: '18',    name: 'Drama',              icon: 'bi-mask' },
        { id: '10751', name: 'Family',             icon: 'bi-people' },
        { id: '10762', name: 'Kids',               icon: 'bi-balloon' },
        { id: '9648',  name: 'Mystery',            icon: 'bi-question-circle' },
        { id: '10763', name: 'News',               icon: 'bi-newspaper' },
        { id: '10764', name: 'Reality',            icon: 'bi-tv' },
        { id: '10765', name: 'Sci-Fi & Fantasy',   icon: 'bi-magic' },
        { id: '10766', name: 'Soap',               icon: 'bi-heart-half' },
        { id: '10767', name: 'Talk',               icon: 'bi-chat-quote' },
        { id: '10768', name: 'War & Politics',     icon: 'bi-shield' },
        { id: '37',    name: 'Western',            icon: 'bi-star' }
    ]
};

/* ---------- TMDB API Cache ---------- */
const _apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/* ---------- TMDB API Fetch ---------- */
async function fetchTMDB(endpoint, params = {}, signal = null) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append("language", "en-US");

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    const cacheKey = url.toString();
    const cached = _apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

    if (_apiCache.size > 100) {
        const now = Date.now();
        for (const [key, val] of _apiCache) {
            if (now - val.ts >= CACHE_TTL) _apiCache.delete(key);
        }
    }

    const headers = { Authorization: `Bearer ${CONFIG.BEARER_TOKEN}` };
    const fetchOptions = { method: "GET", headers };
    if (signal) fetchOptions.signal = signal;

    try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        _apiCache.set(cacheKey, { data, ts: Date.now() });
        return data;
    } catch (error) {
        if (error.name === 'AbortError') return null;
        console.error("Fetch error:", error);
        return null;
    }
}

/* ---------- Media Card Component ---------- */
function createMediaCard(item, type = 'movie', options = {}) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.style.cursor = "pointer";
    if (options.marginBottom) itemDiv.style.marginBottom = "20px";

    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || "N/A";
    const year = date.split("-")[0];
    const mediaType = item.media_type || type;
    const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("poster");

    if (rating && rating > 0) {
        const badge = document.createElement("div");
        badge.classList.add("rating-badge");
        badge.textContent = rating;
        if (rating >= 7) badge.classList.add("high");
        else if (rating >= 5) badge.classList.add("mid");
        else badge.classList.add("low");
        posterDiv.appendChild(badge);
    }

    const overlay = document.createElement("div");
    overlay.classList.add("poster-overlay");
    overlay.innerHTML = '<i class="bi bi-play-fill"></i>';
    posterDiv.appendChild(overlay);

    const posterLink = document.createElement("div");
    const posterImg = document.createElement("img");
    posterImg.draggable = false;
    posterImg.src = item.poster_path
        ? `${CONFIG.IMAGE_MD}${item.poster_path}`
        : `${CONFIG.DOMAIN}/img/empty.png`;
    posterImg.alt = title;
    posterImg.loading = "lazy";

    posterImg.style.opacity = "0";
    posterImg.style.transition = "opacity 0.4s ease";
    posterImg.onload = () => posterImg.style.opacity = "1";

    posterLink.appendChild(posterImg);
    posterDiv.appendChild(posterLink);

    const metaDiv = document.createElement("div");
    metaDiv.classList.add("meta");
    const metaSpan = document.createElement("span");

    let metaText = `${title} (${year})`;
    if (options.showCharacter && item.character) {
        metaText += `<div style="font-size:0.8rem; color:#a0a0a0; margin-top:4px">as ${item.character}</div>`;
    }
    metaSpan.innerHTML = metaText;
    metaDiv.appendChild(metaSpan);

    itemDiv.appendChild(posterDiv);
    itemDiv.appendChild(metaDiv);

    itemDiv.addEventListener("click", () => {
        window.location.href = `player.html?media=${mediaType === 'movie' ? 'movie' : 'tv'}&id=${item.id}`;
    });

    return itemDiv;
}

/* ---------- Skeleton Loaders ---------- */
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

/* ---------- Drag Scroll (Desktop) ---------- */
const _dragScrolled = new WeakSet();

function enableDragScroll(container) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (_dragScrolled.has(container)) return;
    _dragScrolled.add(container);

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

/* ---------- Toast Notification System ---------- */
function showToast(message, type = 'info', duration = 3000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        info: 'bi-info-circle-fill',
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        error: 'bi-x-circle-fill'
    };

    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
    });

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-exit');
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

/* ---------- Back to Top Button ---------- */
function initBackToTop() {
    const btn = document.createElement('div');
    btn.id = 'back-to-top';
    btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------- Section Entrance Animation ---------- */
function initSectionAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, #w-info, .categories-grid').forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
}

/* ---------- Debounce Utility ---------- */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ---------- Time Formatting ---------- */
function formatTime(seconds) {
    if (!seconds || seconds < 0) return '0min';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    if (m === 0) return '<1min';
    return `${m}min`;
}

/* ---------- Init on DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    setTimeout(initSectionAnimations, 100);
});
