const CONFIG = {
    API_KEY: "a16ae8a9e473e167a27b616834d5be28",
    BEARER_TOKEN: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_URL: "https://image.tmdb.org/t/p",
    DOMAIN: "https://kurbutoke.github.io/Kstream"
};

const UI = {
    items: document.getElementById("items"),
    image: document.getElementById("image"),
    readerbg: document.getElementById("reader-bg"),
    reader: document.getElementById("reader"),
    duration: document.getElementById("duration"),
    seasonEpisodeSelection: document.getElementById("season-episode-selection"),
    seasonSelect: document.getElementById("seasonSelect"),
    episodeSelect: document.getElementById("episodeSelect"),
    next: document.getElementById('next'),
    bookmarkIcon: document.getElementById('bookmark'),
    last: document.getElementById('last'),
    refresh: document.getElementById('refresh'),
    selected: document.getElementById('selected'),
    mid: document.getElementById("mid"),
    mediatype: document.getElementById("mediatype"),
    recommendationsItems: document.getElementById("recommendations-items"),
    recommendationsSection: document.getElementById("recommendations")
};

async function fetchTMDB(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", CONFIG.API_KEY);

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

function updateURL(season, episode) {
    const url = new URL(window.location);
    if (season) url.searchParams.set('season', season);
    if (episode) url.searchParams.set('episode', episode);
    window.history.pushState({}, '', url);
}

function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const media = urlParams.get('media');
    const id = urlParams.get('id');
    const season = urlParams.get('season');
    const episode = urlParams.get('episode');

    if (media && id) {
        load(media, id, season, episode);
        updateBookmarkIcon(media, id);
    }
}

function fillOrHide(elementId, value, suffix = "") {
    const el = document.getElementById(elementId);
    if (!el) return;

    const parentRow = el.closest(".detail > div");

    if (value && value.length > 0) {
        el.textContent = value + suffix;
        if (parentRow) parentRow.style.display = "flex";
    } else {
        if (parentRow) parentRow.style.display = "none";
    }
}

async function load(mediaType, itemId, seasonParam = null, episodeParam = null) {
    const data = await fetchTMDB(`/${mediaType}/${itemId}`, { append_to_response: "credits", language: "en-US" });
    if (!data) return;

    const title = data.title ?? data.name;

    document.title = `${title} - Kstream`;

    UI.reader.style.display = "flex";
    document.getElementById("name").textContent = title;

    const posterPath = data.poster_path ? `${CONFIG.IMAGE_URL}/w300${data.poster_path}` : `${CONFIG.DOMAIN}/img/empty.png`;
    UI.image.src = posterPath;

    window.currentMediaData = {
        id: itemId,
        media: mediaType,
        title: title,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        release_date: data.release_date || data.first_air_date
    };

    if (data.backdrop_path) {
        UI.readerbg.style.backgroundImage = `url('${CONFIG.IMAGE_URL}/original${data.backdrop_path}')`;
    }

    UI.mediatype.textContent = mediaType === "movie" ? "Movie" : "TV";
    UI.mid.textContent = itemId;
    document.getElementById("type").textContent = mediaType === "movie" ? "Movie" : "TV";
    document.getElementById("grade").textContent = data.vote_average ? Math.round(data.vote_average * 10) / 10 : "N/A";

    const releaseDate = data.release_date ?? data.first_air_date;
    if (releaseDate) {
        document.getElementById("released").textContent = releaseDate.split("-")[0];
        fillOrHide("release-date", new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }));
    } else {
        fillOrHide("release-date", null);
    }

    if (data.runtime) UI.duration.textContent = `${data.runtime} min`;
    document.getElementById("description").textContent = data.overview || "No description available.";

    fillOrHide("tagline", data.tagline);
    fillOrHide("status", data.status);

    const networks = data.networks ? data.networks.map(n => n.name).join(", ") : "";
    fillOrHide("networks", networks);

    const countries = data.production_countries ? data.production_countries.map(c => c.name).join(", ") : "";
    fillOrHide("country", countries);

    const genres = data.genres ? data.genres.map(g => g.name).join(", ") : "";
    fillOrHide("genres", genres);

    const production = data.production_companies ? data.production_companies.map(c => c.name).join(", ") : "";
    fillOrHide("production", production);

    const castElement = document.getElementById("cast");
    if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
        const castLinks = data.credits.cast.slice(0, 5).map(a => `<a href="person.html?id=${a.id}" class="cast-link">${a.name}</a>`).join(", ");
        castElement.innerHTML = castLinks;
        const parentRow = castElement.closest(".detail > div");
        if (parentRow) parentRow.style.display = "flex";
    } else {
        const parentRow = castElement.closest(".detail > div");
        if (parentRow) parentRow.style.display = "none";
    }

    let directorName = "";
    if (data.credits && data.credits.crew) {
        const director = data.credits.crew.find(member => member.job === "Director");
        if (director) directorName = director.name;
    } else if (data.created_by && data.created_by.length > 0) {
        directorName = data.created_by.map(c => c.name).join(", ");
    }
    fillOrHide("director", directorName);

    if (data.belongs_to_collection) {
        renderCollection(data.belongs_to_collection.id);
    } else {
        const collectionSection = document.getElementById("collection-section");
        if (collectionSection) collectionSection.style.display = "none";
    }

    UI.selected.setAttribute("used", "S1");
    UI.reader.style.display = "block";

    if (mediaType === "movie") {
        let savedServer = "S1";
        try {
            savedServer = localStorage.getItem('lastServer') || "S1";
        } catch (e) { }
        servers(savedServer);
    } else {
        await handleTVShowLogic(data, itemId, seasonParam, episodeParam);
    }

    fetchRecommendations(mediaType, itemId);
}

async function renderCollection(collectionId) {
    const collectionData = await fetchTMDB(`/collection/${collectionId}`);

    if (collectionData && collectionData.parts && collectionData.parts.length > 0) {
        const section = document.getElementById("collection-section");
        const container = document.getElementById("collection-items");
        const title = document.getElementById("collection-title");

        title.textContent = collectionData.name;
        section.style.display = "block";
        container.innerHTML = "";

        // Sort by release date
        const parts = collectionData.parts.sort((a, b) => {
            const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
            const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
            return dateA - dateB;
        });

        const fragment = document.createDocumentFragment();
        parts.forEach(part => {
            if (part.poster_path) {
                fragment.appendChild(createMediaCard(part, 'movie'));
            }
        });

        container.appendChild(fragment);
        enableDragScroll(container);
    } else {
        const collectionSection = document.getElementById("collection-section");
        if (collectionSection) collectionSection.style.display = "none";
    }
}

async function fetchRecommendations(mediaType, itemId) {
    const data = await fetchTMDB(`/${mediaType}/${itemId}/recommendations`);

    if (data && data.results && data.results.length > 0) {
        UI.recommendationsItems.innerHTML = "";
        const fragment = document.createDocumentFragment();

        data.results.forEach(item => {
            if (item.poster_path) {
                fragment.appendChild(createMediaCard(item, mediaType));
            }
        });

        if (fragment.children.length > 0) {
            UI.recommendationsItems.appendChild(fragment);
            UI.recommendationsSection.style.display = "block";
            enableDragScroll(UI.recommendationsItems);
        } else {
            UI.recommendationsSection.style.display = "none";
        }
    } else {
        UI.recommendationsSection.style.display = "none";
    }
}

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
    metaSpan.innerHTML = `${title} (${year})`;
    metaDiv.appendChild(metaSpan);

    itemDiv.appendChild(posterDiv);
    itemDiv.appendChild(metaDiv);

    itemDiv.addEventListener("click", () => {
        window.location.href = `player.html?media=${mediaType === 'movie' ? 'movie' : 'tv'}&id=${item.id}`;
    });

    return itemDiv;
}

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

async function handleTVShowLogic(data, itemId, seasonParam, episodeParam) {
    if (!data.seasons || data.seasons.length === 0) return;

    document.getElementById("boom").style.display = "none";
    UI.items.style.display = "contents";
    UI.seasonSelect.innerHTML = "";
    UI.seasonEpisodeSelection.style.display = "flex";

    const today = new Date();
    let hasSeasons = false;

    data.seasons.forEach(season => {
        if (season.season_number > 0 && season.episode_count > 0) {
            if (season.air_date && new Date(season.air_date) <= today) {
                const option = document.createElement("option");
                option.value = season.season_number;
                option.textContent = `Season ${season.season_number}`;
                UI.seasonSelect.setAttribute("data-max-seasons", season.season_number);
                UI.seasonSelect.appendChild(option);
                hasSeasons = true;
            }
        }
    });

    const maxSeasons = UI.seasonSelect.getAttribute("data-max-seasons");
    UI.duration.textContent = `${maxSeasons} Season${maxSeasons > 1 ? 's' : ''}`;

    if (hasSeasons) {
        let startSeason = 1;
        if (seasonParam && seasonParam <= maxSeasons) {
            startSeason = seasonParam;
            UI.seasonSelect.value = startSeason;
        }

        await loadEpisodesForSeason(itemId, startSeason);

        if (episodeParam) {
            UI.episodeSelect.value = episodeParam;
        }

        let savedServer = "S1";
        try {
            savedServer = localStorage.getItem('lastServer') || "S1";
        } catch (e) { }
        servers(savedServer);
    }
}

async function loadEpisodesForSeason(seriesId, seasonNumber) {
    const data = await fetchTMDB(`/tv/${seriesId}/season/${seasonNumber}`);
    if (!data || !data.episodes) return;

    UI.episodeSelect.innerHTML = "";
    const today = new Date();
    const episodes = data.episodes;

    const fragment = document.createDocumentFragment();
    let maxEp = 0;

    episodes.forEach(episode => {
        if (episode.air_date && new Date(episode.air_date) <= today && episode.episode_number > 0) {
            const option = document.createElement("option");
            option.value = episode.episode_number;
            option.textContent = `Episode ${episode.episode_number}`;
            fragment.appendChild(option);
            maxEp = episode.episode_number;
        }
    });

    UI.episodeSelect.appendChild(fragment);
    UI.episodeSelect.setAttribute("data-max-episodes", maxEp);

    if (UI.episodeSelect.options.length > 0) {
        UI.episodeSelect.value = "1";
    }
}

function servers(serverID) {
    const media = UI.mediatype.textContent.toLowerCase() === "movie" ? "movie" : "tv";
    const id = UI.mid.textContent;
    let url = "";

    const getUrl = (provider) => {
        if (media === "movie") {
            const movieMap = {
                "S1": `https://vidking.net/embed/movie/${id}?autoplay=1`,
                "S2": `https://player.videasy.net/movie/${id}`,
                "S3": `https://vidsrc.to/embed/movie/${id}`,
                "S4": `https://multiembed.mov/?video_id=${id}&tmdb=1`,
                "S5": `https://frembed.ink/api/film.php?id=${id}`
            };
            return movieMap[provider];
        } else {
            const s = UI.seasonSelect.value || 1;
            const e = UI.episodeSelect.value || 1;
            const tvMap = {
                "S1": `https://vidking.net/embed/tv/${id}/${s}/${e}?autoplay=1`,
                "S2": `https://player.videasy.net/tv/${id}/${s}/${e}`,
                "S3": `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
                "S4": `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
                "S5": `https://frembed.ink/api/serie.php?id=${id}&sa=${s}&epi=${e}`
            };
            return tvMap[provider];
        }
    };

    url = getUrl(serverID);
    if (url) {
        UI.reader.src = url;
        UI.selected.setAttribute("used", serverID);

        // Robust UI update: ensure the dropdown matches the active server
        // We check if the option exists before setting it to avoid errors or mismatches
        const optionExists = [...UI.selected.options].some(o => o.value === serverID);
        if (UI.selected && optionExists) {
            UI.selected.value = serverID;
        }

        UI.reader.style.display = "block";

        // Save preference
        try {
            localStorage.setItem('lastServer', serverID);
        } catch (e) {
            console.warn('LocalStorage save failed', e);
        }

        saveToHistory();
    }
}

function saveToHistory(progressData = null) {
    if (!window.currentMediaData) return;

    const history = JSON.parse(localStorage.getItem('watchHistory')) || [];
    const media = UI.mediatype.textContent.toLowerCase() === "movie" ? "movie" : "tv";

    let historyItem = {
        ...window.currentMediaData,
        timestamp: Date.now()
    };

    if (media === 'tv') {
        historyItem.season = UI.seasonSelect.value;
        historyItem.episode = UI.episodeSelect.value;
        historyItem.infoStr = `S${historyItem.season}:E${historyItem.episode}`;
    }

    if (progressData) {
        historyItem.progress = progressData.progress;
        historyItem.currentTime = progressData.currentTime;
        historyItem.duration = progressData.duration;
    }

    const filteredHistory = history.filter(h => !(h.id == historyItem.id && h.media == media));

    filteredHistory.unshift(historyItem);

    if (filteredHistory.length > 20) filteredHistory.pop();

    localStorage.setItem('watchHistory', JSON.stringify(filteredHistory));
}

window.addEventListener("message", function (event) {
    try {
        let msg = event.data;

        // Parse if string
        if (typeof msg === "string") {
            try {
                msg = JSON.parse(msg);
            } catch (e) {
                return; // Not JSON
            }
        }

        if (typeof msg !== "object" || !msg) return;

        // 1. Vidking / Generic PLAYER_EVENT format
        if (msg.type === "PLAYER_EVENT" && msg.data) {
            const data = msg.data;
            if (data.event === "timeupdate" || data.event === "pause") {
                saveProgress(data.progress, data.currentTime, data.duration, data.event);
            }
        }
        // 2. Videasy / Generic Object format (detect by properties)
        // Videasy often sends: { event: "timeupdate", time: 123, duration: 456 } or similar
        else if (msg.event === "timeupdate" || msg.event === "pause" || msg.type === "timeupdate") {
            const currentTime = msg.currentTime || msg.time || (msg.data ? msg.data.currentTime : 0);
            const duration = msg.duration || (msg.data ? msg.data.duration : 0);
            let progress = msg.progress || (msg.data ? msg.data.progress : 0);

            if (!progress && duration > 0 && currentTime > 0) {
                progress = (currentTime / duration) * 100;
            }

            if (currentTime && duration) {
                saveProgress(progress, currentTime, duration, msg.event || msg.type);
            }
        }
    } catch (e) {
        console.error("Error handling message:", e);
    }
});

function saveProgress(progress, currentTime, duration, eventType) {
    const now = Date.now();
    if (!window.lastHistorySave || (now - window.lastHistorySave > 5000) || eventType === "pause") {
        saveToHistory({
            progress: progress,
            currentTime: currentTime,
            duration: duration
        });
        window.lastHistorySave = now;
    }
}

UI.seasonSelect.addEventListener("change", async () => {
    const seriesId = UI.mid.textContent;
    const season = UI.seasonSelect.value;
    await loadEpisodesForSeason(seriesId, season);
    servers(UI.selected.getAttribute('used'));
    updateURL(season, UI.episodeSelect.value);
});

UI.episodeSelect.addEventListener("change", () => {
    servers(UI.selected.getAttribute('used'));
    updateURL(UI.seasonSelect.value, UI.episodeSelect.value);
});

UI.refresh.addEventListener('click', () => {
    const currentSrc = UI.reader.src;
    UI.reader.src = currentSrc;
});

UI.next.addEventListener('click', () => {
    const currentEpisode = parseInt(UI.episodeSelect.value);
    const currentSeason = parseInt(UI.seasonSelect.value);
    const maxSeasons = parseInt(UI.seasonSelect.getAttribute('data-max-seasons'));
    const maxEpisodes = parseInt(UI.episodeSelect.getAttribute('data-max-episodes'));

    if (currentEpisode < maxEpisodes) {
        UI.episodeSelect.value = (currentEpisode + 1).toString();
        servers(UI.selected.getAttribute('used'));
        updateURL(UI.seasonSelect.value, UI.episodeSelect.value);
    } else if (currentSeason < maxSeasons) {
        UI.seasonSelect.value = (currentSeason + 1).toString();
        UI.seasonSelect.dispatchEvent(new Event('change'));
    } else {
        alert('You finished the show');
    }
});

UI.last.addEventListener('click', async () => {
    const maxSeasons = parseInt(UI.seasonSelect.getAttribute('data-max-seasons'));
    UI.seasonSelect.value = maxSeasons;

    await loadEpisodesForSeason(UI.mid.textContent, maxSeasons);

    const maxEpisodes = parseInt(UI.episodeSelect.getAttribute('data-max-episodes'));
    UI.episodeSelect.value = maxEpisodes;

    servers(UI.selected.getAttribute('used'));
    updateURL(UI.seasonSelect.value, UI.episodeSelect.value);
});

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function setFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(mediaType, mediaId) {
    const favorites = getFavorites();
    const exists = favorites.some(f => f.media === mediaType && f.id === mediaId);

    let newFavorites;
    if (exists) {
        newFavorites = favorites.filter(f => !(f.media === mediaType && f.id === mediaId));
    } else {
        favorites.push({ media: mediaType, id: mediaId });
        newFavorites = favorites;
    }

    setFavorites(newFavorites);
    updateBookmarkIcon(mediaType, mediaId);
}

function updateBookmarkIcon(mediaType, mediaId) {
    const favorites = getFavorites();
    const exists = favorites.some(f => f.media === mediaType && f.id === mediaId);

    if (exists) {
        UI.bookmarkIcon.classList.remove('bi-bookmark');
        UI.bookmarkIcon.classList.add('bi-bookmark-fill');
    } else {
        UI.bookmarkIcon.classList.remove('bi-bookmark-fill');
        UI.bookmarkIcon.classList.add('bi-bookmark');
    }
}

UI.bookmarkIcon.addEventListener('click', function () {
    const mediaType = UI.mediatype.textContent.toLowerCase() === "movie" ? "movie" : "tv";
    const mediaId = UI.mid.textContent;
    toggleFavorite(mediaType, mediaId);
});

function generateAndCopyLink() {
    const media = UI.mediatype.textContent.toLowerCase() === "movie" ? "movie" : "tv";
    const id = UI.mid.textContent;
    const linkURL = `${CONFIG.DOMAIN}/player.html?media=${media}&id=${id}`;

    if (navigator.share) {
        navigator.share({
            title: 'Watch on Kstream',
            text: 'Watch this amazing content on Kstream:',
            url: linkURL
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(linkURL)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.error('Copy failed', err));
    }
}

window.addEventListener('load', getURLParameters);