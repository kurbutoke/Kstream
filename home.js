// Constants
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc";
const DOMAIN = "https://kurbutoke.github.io/Kstream";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w400";

const headers = { Authorization: `Bearer ${API_KEY}` };

// DOM Elements
const elements = {
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("search-results"),
  items: document.getElementById("items"),
  movieItems: document.getElementById("movie-items"),
  tvItems: document.getElementById("tv-items"),
  favoritesItems: document.getElementById("favorites-items")
};

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function createMediaElement({ title, year, posterPath, id, mediaType }) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");
  
  const posterDiv = document.createElement("div");
  posterDiv.classList.add("poster");
  
  const posterLink = document.createElement("div");
  
  const posterImg = document.createElement("img");
  posterImg.draggable = false;
  posterImg.src = posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : `${DOMAIN}/img/empty.png`;
  posterImg.alt = title;
  posterImg.loading = "lazy";
  
  const metaDiv = document.createElement("div");
  metaDiv.classList.add("meta");
  
  const metaSpan = document.createElement("span");
  metaSpan.innerHTML = `${title} (${year})`;
  
  posterLink.appendChild(posterImg);
  posterDiv.appendChild(posterLink);
  metaDiv.appendChild(metaSpan);
  itemDiv.appendChild(posterDiv);
  itemDiv.appendChild(metaDiv);
  
  itemDiv.addEventListener("click", () => {
    window.location.href = `${DOMAIN}/player.html?media=${mediaType}&id=${id}`;
  });
  
  return itemDiv;
}

async function fetchTMDBData(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${TMDB_BASE_URL}${endpoint}?${queryString}`;
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

// Search Functionality
elements.searchInput.addEventListener("input", debounce(async (event) => {
  const searchTerm = event.target.value.trim();
  elements.searchResults.innerHTML = "";
  
  if (searchTerm.length === 0) return;
  
  elements.searchResults.style.display = "inline";
  const data = await fetchTMDBData("/search/multi", { query: searchTerm });
  
  if (!data?.results) return;
  
  data.results.slice(0, 5).forEach(item => {
    const mediaItem = document.createElement("div");
    mediaItem.className = "item";
    mediaItem.style.cursor = "pointer";
    
    const title = item.title || item.name;
    const year = (item.first_air_date || item.release_date)?.slice(0, 4) || "N/A";
    const mediaType = item.media_type === "movie" ? "Movie" : "TV";
    const percentage = Math.round(item.vote_average * 10);
    
    mediaItem.innerHTML = `
      <img class="poster" src="${item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : `${DOMAIN}/img/empty.png`}" alt="${title}">
      <div class="info">
        <a class="name" href="${DOMAIN}/player.html?media=${item.media_type}&id=${item.id}">${title}</a>
        <span class="meta">${mediaType} • ${year} • ${percentage}%</span>
      </div>
    `;
    
    elements.searchResults.appendChild(mediaItem);
  });
}, 300));

// Fetch Trending Content
async function fetchTrendingMovies() {
  const data = await fetchTMDBData("/trending/movie/week", { language: "en-US" });
  if (!data?.results) return;
  
  data.results.slice(0, 10).forEach(movie => {
    const mediaElement = createMediaElement({
      title: movie.title,
      year: movie.release_date.slice(0, 4),
      posterPath: movie.poster_path,
      id: movie.id,
      mediaType: "movie"
    });
    elements.movieItems.appendChild(mediaElement);
  });
}

async function fetchTrendingTV() {
  const data = await fetchTMDBData("/trending/tv/week", { language: "en-US" });
  if (!data?.results) return;
  
  data.results.slice(0, 10).forEach(tv => {
    const mediaElement = createMediaElement({
      title: tv.name,
      year: tv.first_air_date.slice(0, 4),
      posterPath: tv.poster_path,
      id: tv.id,
      mediaType: "tv"
    });
    elements.tvItems.appendChild(mediaElement);
  });
}

// Favorites Management
async function fetchFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || "[]");
  
  if (!favorites.length) {
    const emptyMessage = document.createElement("div");
    emptyMessage.textContent = 'You have no bookmarked medias';
    emptyMessage.className = "text-center";
    emptyMessage.style.padding = "1rem";
    elements.favoritesItems.appendChild(emptyMessage);
    return;
  }
  
  for (const { media, id } of favorites) {
    const data = await fetchTMDBData(`/${media}/${id}`, { append_to_response: "credits" });
    if (!data) continue;
    
    const mediaElement = createMediaElement({
      title: data.title || data.name,
      year: (data.first_air_date || data.release_date)?.slice(0, 4),
      posterPath: data.poster_path,
      id: data.id,
      mediaType: media
    });
    elements.favoritesItems.appendChild(mediaElement);
  }
}

// Tab Management
function toggleTab(activeId, inactiveId1, inactiveId2, activeElementId, inactiveElementId1, inactiveElementId2) {
  const elements = {
    active: document.getElementById(activeId),
    inactive1: document.getElementById(inactiveId1),
    inactive2: document.getElementById(inactiveId2),
    activeContent: document.getElementById(activeElementId),
    inactiveContent1: document.getElementById(inactiveElementId1),
    inactiveContent2: document.getElementById(inactiveElementId2)
  };
  
  elements.active.classList.add('active');
  elements.inactive1.classList.remove('active');
  elements.inactive2.classList.remove('active');
  
  elements.activeContent.style.display = 'block';
  elements.inactiveContent1.style.display = 'none';
  elements.inactiveContent2.style.display = 'none';
}

// Initialize
window.addEventListener("load", () => {
  Promise.all([
    fetchTrendingMovies(),
    fetchTrendingTV(),
    fetchFavorites()
  ]).catch(console.error);
});