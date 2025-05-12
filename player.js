// Constants
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DOMAIN = "https://kurbutoke.github.io/Kstream";

// DOM Elements
const elements = {
  reader: document.getElementById("reader"),
  readerBg: document.getElementById("reader-bg"),
  image: document.getElementById("image"),
  seasonSelect: document.getElementById("seasonSelect"),
  episodeSelect: document.getElementById("episodeSelect"),
  controls: document.getElementById("controls"),
  serverSelect: document.getElementById("selected"),
  bookmarkIcon: document.getElementById("bookmark"),
  nextButton: document.getElementById("next"),
  lastButton: document.getElementById("last"),
  refreshButton: document.getElementById("refresh")
};

const headers = { Authorization: `Bearer ${API_KEY}` };

// Utility Functions
async function fetchTMDBData(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?${queryString}`,
      { headers }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

function updateUIElement(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateMetadata(data) {
  const title = data.title || data.name;
  const releaseDate = data.release_date || data.first_air_date;
  const year = releaseDate?.split("-")[0];
  
  updateUIElement("name", title);
  updateUIElement("type", data.media_type === "movie" ? "Movie" : "TV");
  updateUIElement("mediatype", data.media_type === "movie" ? "Movie" : "TV");
  updateUIElement("grade", Math.round(data.vote_average * 10) / 10);
  updateUIElement("released", year);
  updateUIElement("duration", data.runtime ? `${data.runtime} min` : null);
  updateUIElement("description", data.overview);
  updateUIElement("country", data.production_countries.map(c => c.name).join(", "));
  updateUIElement("genres", data.genres.map(g => g.name).join(", "));
  updateUIElement("release-date", new Date(releaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }));
  updateUIElement("production", data.production_companies.map(c => c.name).join(", "));
  updateUIElement("cast", data.credits.cast.slice(0, 5).map(a => a.name).join(", "));
}

// Player Functions
async function loadMedia(mediaType, itemId) {
  const data = await fetchTMDBData(`/${mediaType}/${itemId}`, {
    append_to_response: "credits",
    language: "en-US"
  });
  
  if (!data) return;
  
  elements.reader.style.display = "block";
  elements.image.src = data.poster_path ? 
    `https://image.tmdb.org/t/p/w300${data.poster_path}` : 
    `${DOMAIN}/img/empty.png`;
  elements.readerBg.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`;
  
  updateMetadata(data);
  updateBookmarkIcon(mediaType, itemId);
  
  if (mediaType === "tv") {
    await setupTVShow(itemId, data);
  }
  
  updatePlayer(mediaType, itemId);
}

async function setupTVShow(showId, data) {
  if (!data.number_of_seasons) return;
  
  document.getElementById("boom").style.display = "none";
  document.getElementById("items").style.display = "contents";
  
  const seasons = data.seasons.filter(season => 
    season.air_date && 
    season.episode_count > 0 && 
    season.season_number > 0 && 
    new Date(season.air_date) <= new Date()
  );
  
  if (seasons.length === 0) return;
  
  elements.seasonSelect.innerHTML = seasons.map(season => 
    `<option value="${season.season_number}">Season ${season.season_number}</option>`
  ).join("");
  
  elements.seasonSelect.setAttribute("data-max-seasons", Math.max(...seasons.map(s => s.season_number)));
  
  await updateEpisodeList(showId, 1);
}

async function updateEpisodeList(showId, seasonNumber) {
  const seasonData = await fetchTMDBData(`/tv/${showId}/season/${seasonNumber}`);
  if (!seasonData?.episodes) return;
  
  const today = new Date();
  const availableEpisodes = seasonData.episodes.filter(episode => 
    new Date(episode.air_date) <= today && episode.episode_number > 0
  );
  
  elements.episodeSelect.innerHTML = availableEpisodes.map(episode =>
    `<option value="${episode.episode_number}">Episode ${episode.episode_number}</option>`
  ).join("");
  
  elements.episodeSelect.setAttribute("data-max-episodes", availableEpisodes.length);
}

function updatePlayer(mediaType, id) {
  const server = elements.serverSelect.getAttribute("used") || "S1";
  const season = elements.seasonSelect?.value || "1";
  const episode = elements.episodeSelect?.value || "1";
  
  const streamingURLs = {
    S1: {
      movie: `https://vidsrc.to/embed/movie/${id}`,
      tv: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
    },
    S2: {
      movie: `https://vidsrc.me/embed/movie?tmdb=${id}&color=00acc1`,
      tv: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&color=00acc1`
    },
    S3: {
      movie: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      tv: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
    },
    S4: {
      movie: `https://frembed.ink/api/film.php?id=${id}`,
      tv: `https://frembed.ink/api/serie.php?id=${id}&sa=${season}&epi=${episode}`
    }
  };
  
  elements.reader.src = streamingURLs[server][mediaType === "movie" ? "movie" : "tv"];
  elements.serverSelect.setAttribute("used", server);
}

// Favorites Management
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function setFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(mediaType, mediaId) {
  const favorites = getFavorites();
  const mediaKey = mediaType.toLowerCase();
  const exists = favorites.some(f => f.media === mediaKey && f.id === mediaId);
  
  if (exists) {
    setFavorites(favorites.filter(f => !(f.media === mediaKey && f.id === mediaId)));
  } else {
    favorites.push({ media: mediaKey, id: mediaId });
    setFavorites(favorites);
  }
  
  updateBookmarkIcon(mediaType, mediaId);
}

function updateBookmarkIcon(mediaType, mediaId) {
  const isFavorite = getFavorites().some(
    f => f.media === mediaType.toLowerCase() && f.id === mediaId
  );
  
  elements.bookmarkIcon.classList.toggle('bi-bookmark', !isFavorite);
  elements.bookmarkIcon.classList.toggle('bi-bookmark-fill', isFavorite);
}

// Event Listeners
elements.seasonSelect?.addEventListener("change", async () => {
  await updateEpisodeList(
    document.getElementById("mid").textContent,
    elements.seasonSelect.value
  );
  updatePlayer(
    document.getElementById("mediatype").textContent.toLowerCase(),
    document.getElementById("mid").textContent
  );
});

elements.episodeSelect?.addEventListener("change", () => {
  updatePlayer(
    document.getElementById("mediatype").textContent.toLowerCase(),
    document.getElementById("mid").textContent
  );
});

elements.nextButton?.addEventListener("click", () => {
  const currentEpisode = parseInt(elements.episodeSelect.value);
  const currentSeason = parseInt(elements.seasonSelect.value);
  const maxSeasons = parseInt(elements.seasonSelect.getAttribute('data-max-seasons'));
  const maxEpisodes = parseInt(elements.episodeSelect.getAttribute('data-max-episodes'));
  
  if (currentEpisode === maxEpisodes) {
    if (currentSeason < maxSeasons) {
      elements.seasonSelect.value = (currentSeason + 1).toString();
      elements.seasonSelect.dispatchEvent(new Event('change'));
    } else {
      alert('You finished the show');
    }
  } else {
    elements.episodeSelect.value = (currentEpisode + 1).toString();
    elements.episodeSelect.dispatchEvent(new Event('change'));
  }
});

elements.lastButton?.addEventListener("click", async () => {
  const maxSeasons = elements.seasonSelect.getAttribute('data-max-seasons');
  elements.seasonSelect.value = maxSeasons;
  await updateEpisodeList(document.getElementById("mid").textContent, maxSeasons);
  
  const maxEpisode = elements.episodeSelect.options.length;
  elements.episodeSelect.value = maxEpisode.toString();
  updatePlayer(
    document.getElementById("mediatype").textContent.toLowerCase(),
    document.getElementById("mid").textContent
  );
});

elements.refreshButton?.addEventListener("click", () => {
  elements.reader.src = elements.reader.src;
});

elements.bookmarkIcon?.addEventListener("click", () => {
  const mediaType = document.getElementById("mediatype").textContent;
  const mediaId = document.getElementById("mid").textContent;
  toggleFavorite(mediaType, mediaId);
});

elements.serverSelect?.addEventListener("change", function() {
  updatePlayer(
    document.getElementById("mediatype").textContent.toLowerCase(),
    document.getElementById("mid").textContent
  );
});

// Initialize
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mediaType = urlParams.get('media');
  const id = urlParams.get('id');
  
  if (mediaType && id) {
    loadMedia(mediaType, id);
  }
});