const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("search-results");
const items = document.getElementById("items");
const headers = new Headers();
const body = document.body;
const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc";
const domain = "https://kurbutoke.github.io/Kstream"

searchInput.addEventListener("input", debounce(async (event) => {
    const searchTerm = event.target.value.trim();
    searchResults.innerHTML = "";
    if (searchTerm.length > 0) {
        try {
            searchResults.style.display = "inline";
            const headers = {Authorization: `Bearer ${apiKey}`};
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${searchTerm}`, {
                    method: "GET",
                    headers: headers,
                });
            const data = await response.json();
            data.results.slice(0, 5).forEach((item) => {
                const mediaItem = document.createElement("div");
                const poster = document.createElement("img");
                poster.src = item.poster_path === null ? `${domain}/img/empty.png` : `https://image.tmdb.org/t/p/w400${item.poster_path}`;
                poster.className = "poster";
                const mediaItemDetails = document.createElement("div");
                mediaItemDetails.className = "info";
                const titleElement = document.createElement("a");
                const title = item.title ? item.title : item.name;
                titleElement.textContent = title;
                titleElement.className = "name";
                titleElement.href = item.media_type === "movie"  ? `${domain}/player.html?media=movie&id=${item.id}`  : `${domain}/player.html?media=tv&id=${item.id}`;
                const releaseDate = document.createElement("span");
                releaseDate.className = "meta";
                const mediaType = item.media_type === "movie" ? "Movie" : "TV";
                const year = item.first_air_date ? item.first_air_date.slice(0, 4) : item.release_date.slice(0, 4);
                const percentage = Math.round(item.vote_average * 10);
                releaseDate.textContent = `${mediaType} • ${year} • ${percentage}%`;
                mediaItem.style.cursor = "pointer";
                mediaItem.className = "item";
                mediaItem.appendChild(poster);
                mediaItem.appendChild(mediaItemDetails);
                mediaItemDetails.appendChild(titleElement);
                mediaItemDetails.appendChild(releaseDate);
                searchResults.appendChild(mediaItem);
                mediaItem.addEventListener("click", () => {
                    const redirectionURL = item.media_type === "movie" ? `${domain}/player.html?media=movie&id=${item.id}` : `${domain}/player.html?media=tv&id=${item.id}`;
                    window.location.href = redirectionURL;
                });
            });
        } catch (error) {
            console.error("Error", error);
        }
    }
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function fetchTrendingMovies() {
    try {
        const apiUrl = `https://api.themoviedb.org/3/trending/movie/week?language=en-US&api_key=a16ae8a9e473e167a27b616834d5be28`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const results = data.results.slice(0, 10);
        const filmList = document.getElementById("movie-items");
        results.forEach((movie, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            const posterDiv = document.createElement("div");
            posterDiv.classList.add("poster");
            const posterLink = document.createElement("div");
            const posterImg = document.createElement("img");
            posterImg.draggable = false;
            posterImg.src = `https://image.tmdb.org/t/p/w400${movie.poster_path}`;
            posterImg.alt = movie.title;
            posterLink.appendChild(posterImg);
            posterDiv.appendChild(posterLink);
            const metaDiv = document.createElement("div");
            metaDiv.classList.add("meta");
            const metaSpan = document.createElement("span");
            const release = movie.release_date.split("-")[0];
            metaSpan.innerHTML = `${movie.title} (${release})`;
            metaSpan.href = movie.mediaType === "movie" ? `${domain}/player.html?media=movie&id=${movie.id}` : `${domain}/player.html?media=tv&id=${movie.id}`;
            metaDiv.appendChild(metaSpan);
            itemDiv.appendChild(posterDiv);
            itemDiv.appendChild(metaDiv);
            filmList.appendChild(itemDiv);
            itemDiv.addEventListener("click", () => {const redirectionURL = `player.html?media=movie&id=${movie.id}`;
            window.location.href = redirectionURL;
            });
        });
    } catch (error) {
        console.error("Erreur lors de la requête API:", error);
    }
}

async function fetchTrendingTV() {
    try {
        const apiUrl = `https://api.themoviedb.org/3/trending/tv/week?language=en-US&api_key=a16ae8a9e473e167a27b616834d5be28`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const results = data.results.slice(0, 10);
        const filmList = document.getElementById("tv-items");
        results.forEach((tv, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            const posterDiv = document.createElement("div");
            posterDiv.classList.add("poster");
            const posterLink = document.createElement("div");
            const posterImg = document.createElement("img");
            posterImg.draggable = false;
            posterImg.src = `https://image.tmdb.org/t/p/w400${tv.poster_path}`;
            posterImg.alt = tv.name;
            posterImg.loading = "lazy";
            posterLink.appendChild(posterImg);
            posterDiv.appendChild(posterLink);
            const metaDiv = document.createElement("div");
            metaDiv.classList.add("meta");
            const metaSpan = document.createElement("span");
            const Year = tv.first_air_date.split("-")[0];
            metaSpan.innerHTML = `${tv.name} (${Year})`;
            metaDiv.appendChild(metaSpan);
            itemDiv.appendChild(posterDiv);
            itemDiv.appendChild(metaDiv);
            filmList.appendChild(itemDiv);
            itemDiv.addEventListener("click", () => {const redirectionURL = `player.html?media=tv&id=${tv.id}`;
            window.location.href = redirectionURL;
            });
        });
    } catch (error) {
        console.error("Erreur lors de la requête API:", error);
    }
}

async function fetchFavorites() {
    const favoritesData = localStorage.getItem('favorites');
    const favorites = JSON.parse(favoritesData);
    if (!favorites || favorites.length === 0 || favorites === "[]") {
        const filmList = document.getElementById("favorites-items");
        const itemDiv = document.createElement("div");
        itemDiv.textContent = 'You have no bookmarked medias';
        itemDiv.classList.add("text-center");
        itemDiv.style.padding = "1rem";
        filmList.appendChild(itemDiv);
    } else {
        for (const favorite of favorites) {
            const media = favorite.media;
            const id = favorite.id;
            const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
            const apiUrl = `https://api.themoviedb.org/3/${media}/${id}?append_to_response=credits&language=en-US`;
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: headers,
                });
                if (!response.ok) {
                    console.error(`Erreur lors de la requête API pour ${media} (ID: ${id})`);
                    continue;
                }
                const data = await response.json();
                const filmList = document.getElementById("favorites-items");
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                const posterDiv = document.createElement("div");
                posterDiv.classList.add("poster");
                const posterLink = document.createElement("div");
                const posterImg = document.createElement("img");
                posterImg.draggable = false;
                posterImg.src = `https://image.tmdb.org/t/p/w400${data.poster_path}`; 
                const title = data.title ?? data.name;
                posterImg.alt = title;
                posterImg.loading = "lazy";
                posterLink.appendChild(posterImg);
                posterDiv.appendChild(posterLink);
                const metaDiv = document.createElement("div");
                metaDiv.classList.add("meta");
                const metaSpan = document.createElement("span");
                const year = data.first_air_date ? data.first_air_date.slice(0, 4) : data.release_date.slice(0, 4);
                metaSpan.innerHTML = `${title} (${year})`;
                metaDiv.appendChild(metaSpan);
                itemDiv.appendChild(posterDiv);
                itemDiv.appendChild(metaDiv);
                filmList.appendChild(itemDiv);
                itemDiv.addEventListener("click", () => {
                    const redirectionURL = `player.html?media=${media.toLowerCase()}&id=${id}`;
                    window.location.href = redirectionURL;
                });
            } catch (error) {
                console.error('Error', error);
                filmList.appendChild(itemDiv);
            }
        }
    }
}


function toggleTab(activeId, inactiveId1, inactiveId2, activeElementId, inactiveElementId1, inactiveElementId2) {
    var activeTab = document.getElementById(activeId);
    var inactiveTab1 = document.getElementById(inactiveId1);
    var inactiveTab2 = document.getElementById(inactiveId2);
    var activeElement = document.getElementById(activeElementId);
    var inactiveElement1 = document.getElementById(inactiveElementId1);
    var inactiveElement2 = document.getElementById(inactiveElementId2);
    activeTab.classList.add('active');
    inactiveTab1.classList.remove('active');
    inactiveTab2.classList.remove('active');
    activeElement.style.display = 'block';
    inactiveElement1.style.display = 'none';
    inactiveElement2.style.display = 'none';
}

window.addEventListener("load", (event) => {
    fetchTrendingMovies();
    fetchTrendingTV();
    fetchFavorites();
});

//document.addEventListener("contextmenu", function(e) {
//    e.preventDefault();
//});
//
//if (window.console && window.console.log) {
//    console.log("Please stop trying...");
//    window.location.href = "https://www.google.com";
//}
//
//document.onkeydown = function(e) {
//    if (event.keyCode == 123) {
//        return false;
//    }
//    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
//        return false;
//    }
//    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
//        return false;
//    }
//    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
//        return false;
//    }
//    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
//        return false;
//    }
//}