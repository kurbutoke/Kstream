const items = document.getElementById("items");
const headers = new Headers();
const body = document.body;
const image = document.getElementById("image");
const readerbg = document.getElementById("reader-bg");
const reader = document.getElementById("reader");
const duration = document.getElementById("duration");
const director = document.getElementById("director");
const seasonEpisodeSelection = document.getElementById("season-episode-selection");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");
const next = document.getElementById('next');
const bookmarkIcon = document.getElementById('bookmark');
const last = document.getElementById('last');
const refresh = document.getElementById('refresh');

let selectedSeriesId = null;
let selectedSeason = null;
let selectedEpisode = null;

function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const tvParam = urlParams.get('media');
    const idParam = urlParams.get('id');
    load(tvParam, idParam);
    updateBookmarkIcon(tvParam, idParam);
}

async function load(MediaType, itemId) {
    try {
        const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
        const response = await fetch(
            `https://api.themoviedb.org/3/${MediaType}/${itemId}?append_to_response=credits&language=en-US`, {
                method: "GET",
                headers: headers,
            });
        const data = await response.json();
        reader.style.display = "flex";
        document.getElementById("name").textContent = data.title ?? data.name;
        image.src = data.poster_path === "" ? "https://kurbutoke.github.io/Kstream/img/empty.png" : `https://image.tmdb.org/t/p/w300${data.poster_path}`;
        readerbg.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`;
        reader.src = MediaType === "movie" ? `https://vidsrc.to/embed/movie/${data.id}` : `https://vidsrc.to/embed/tv/${data.id}/1/1`;
        document.getElementById('selected').setAttribute("used", "S1");
        reader.style.display = "block";
        document.getElementById("mediatype").textContent = MediaType === "movie" ? "Movie" : "TV";
        document.getElementById("mid").textContent = itemId;
        document.getElementById("type").textContent = MediaType === "movie" ? "Movie" : "TV";
        document.getElementById("grade").textContent = Math.round(data.vote_average * 10) / 10;
        const releaseDate = data.release_date ?? data.first_air_date;
        document.getElementById("released").textContent = releaseDate.split("-")[0];
        // director.textContent = data.credits.crew.find((member) => member.job === "Director").name ?? data.created_by.find((member) => member.job === "Director");
        duration.textContent = data.runtime && `${data.runtime} min`;
        document.getElementById("description").textContent = data.overview;
        document.getElementById("country").textContent = data.production_countries.map((country) => country.name).join(", ");
        document.getElementById("genres").textContent = data.genres.map((genre) => genre.name).join(", ");
        document.getElementById("release-date").textContent = new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
        document.getElementById("production").textContent = data.production_companies.map((company) => company.name).join(", ");
        document.getElementById("cast").textContent = data.credits.cast.slice(0, 5).map((actor) => actor.name).join(", ");

        if (MediaType === "tv" && data.number_of_seasons > 0) {
            document.getElementById("boom").style.display = "none";
            items.style.display = "contents";
            seasonSelect.innerHTML = "";
            const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${itemId}`, {
                method: "GET",
                headers: headers,
            });
        const data = await response.json();
        const seasons = data.seasons;
        if (seasons && seasons.length > 0) {
            seasonSelect.innerHTML = "";
            seasons.forEach(season => {
                if (season.air_date !== null && season.episode_count > 0 && season.season_number > 0) { 
                    const airDate = new Date(season.air_date);
                    const today = new Date();
                    if (airDate <= today) {
                        const option = document.createElement("option");
                        option.value = season.season_number;
                        option.textContent = `Season ${season.season_number}`;
                        seasonSelect.setAttribute("data-max-seasons", `${season.season_number}`);
                        seasonSelect.appendChild(option);
                        if (season.season_number > 1) {
                            duration.textContent = `${season.season_number} Seasons`;
                        } else {
                            duration.textContent = `${season.season_number} Season`;
                        }
                    }
                }
            });
            seasonEpisodeSelection.style.display = "contents";
        }

            try {
                const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${itemId}/season/1`, {
                    method: "GET",
                    headers: headers,
                });
                const seasonData = await seasonResponse.json();
                const episodes = seasonData.episodes;
                const today = new Date();
                episodes.forEach(episode => {
                    const airDate = new Date(episode.air_date);
                    if (airDate <= today && episode.episode_number > 0) {
                        const option = document.createElement("option");
                        option.value = episode.episode_number;
                        option.textContent = `Episode ${episode.episode_number}`;
                        episodeSelect.setAttribute("data-max-episodes", `${episode.episode_number}`);
                        episodeSelect.appendChild(option);
                    }
                });
            } catch (error) {
                console.error("Error fetching season data:", error);
            }
        }
    } catch (error) {
        console.error("Error fetching media data:", error);
    }
}; 

seasonSelect.addEventListener("change", async () => {
    selectedSeason = seasonSelect.value;
    episodeSelect.innerHTML = "";
    const headers = {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
    };

    try {
        const seasonResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${mid.innerText}/season/${selectedSeason}`,
            { method: "GET", headers: headers }
        );
        const seasonData = await seasonResponse.json();
        const episodes = seasonData.episodes;
        const today = new Date();

        episodes.forEach((episode) => {
            const airDate = new Date(episode.air_date);
            if (airDate <= today) {
                const option = document.createElement("option");
                option.value = episode.episode_number;
                option.textContent = `Episode ${episode.episode_number}`;
                episodeSelect.setAttribute("data-max-episodes", `${episodes.length}`);
                episodeSelect.appendChild(option);
            }
        });

        if (episodes.length > 0) {
            episodeSelect.value = "1";
            selectedEpisode = 1;
            servers(document.getElementById("selected").getAttribute("used"));
        }
    } catch (error) {
        console.error("Error fetching season data:", error);
    }
});

function generateAndCopyLink() {
    const mediaElement = document.getElementById('mediatype');
    const midElement = document.getElementById('mid');
    const media = mediaElement.textContent;
    const id = midElement.textContent;
    const linkURL = media === "Movie" ? `https://kurbutoke.github.io/Kstream/player.html?media=movie&id=${id}` : `https://kurbutoke.github.io/Kstream/player.html?media=tv&id=${id}`;
    navigator.clipboard.writeText(linkURL)
                .then(() => {
                    if (navigator.share) {
                        navigator.share({
                            title: 'Share the link',
                            text: 'Here the link you wanna share :',
                            url: linkURL
                        }).catch((error) => {
                            console.error('Error', error);
                        });
                    } else {
                        console.error('Share fonction error.');
                    }
                })
                .catch((err) => {
                    console.error('Error during the copy of the link :', err);
                    alert('Error during the copy of the link.');
                });
};

function servers(serv) {
    const urlParams = new URLSearchParams(window.location.search);
    const media = urlParams.get('media');
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');

    let streamingURL = '';

    if (media === "movie") {
        switch(serv) {
            case "S1":
                streamingURL = `https://vidsrc.to/embed/movie/${mid.innerText}`;
                break;
            case "S2":
                streamingURL = `https://vidsrc.me/embed/movie?tmdb=${mid.innerText}&color=00acc1`;
                break;
            case "S3":
                streamingURL = `https://multiembed.mov/?video_id=${mid.innerText}&tmdb=1`;
                break;
            case "S4":
                streamingURL = `https://frembed.pro/api/film.php?id=${mid.innerText}`;
                break;
            default:
                break;
        }
    } else {
        const s = seasonSelect.value;
        const e = episodeSelect.value;

        switch(serv) {
            case "S1":
                streamingURL = `https://vidsrc.to/embed/tv/${mid.innerText}/${s}/${e}`;
                break;
            case "S2":
                streamingURL = `https://vidsrc.me/embed/tv?tmdb=${mid.innerText}&season=${s}&episode=${e}&color=00acc1`;
                break;
            case "S3":
                streamingURL = `https://multiembed.mov/?video_id=${mid.innerText}&tmdb=1&s=${s}&e=${e}`;
                break;
            case "S4":
                streamingURL = `https://frembed.pro/api/serie.php?id=${mid.innerText}&sa=${s}&epi=${e}`;
                break;
            default:
                break;
        }

        reader.style.display = "block";
        document.getElementById('selected').setAttribute("used", serv);
    }

    reader.src = streamingURL;
}

seasonSelect.addEventListener("change", async () => {
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            servers(document.getElementById('selected').getAttribute('used'));
});

episodeSelect.addEventListener("change", async () => {
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            servers(document.getElementById('selected').getAttribute('used'));
});

next.addEventListener('click', () => {
    const currentEpisode = parseInt(episodeSelect.value);
    const currentSeason = parseInt(seasonSelect.value);
    const maxSeasons = parseInt(seasonSelect.getAttribute('data-max-seasons'));
    const maxEpisodes = parseInt(episodeSelect.getAttribute('data-max-episodes'));

    if (currentEpisode === maxEpisodes) {
        if (currentSeason < maxSeasons) {
            seasonSelect.value = (currentSeason + 1).toString();
            episodeSelect.value = '1';
            servers(document.getElementById('selected').getAttribute('used'));
        } else {
            alert('You finished the show');
        }
    } else {
        episodeSelect.value = (currentEpisode + 1).toString();
        servers(document.getElementById('selected').getAttribute('used'));
    }
});

last.addEventListener('click', async () => {
    try {
        const maxSeasons = parseInt(seasonSelect.getAttribute('data-max-seasons'));
        seasonSelect.value = maxSeasons;
        selectedSeason = maxSeasons;
        const headers = {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
        }
        const seasonResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${mid.innerText}/season/${maxSeasons}`,
            { method: "GET", headers }
        );
        const seasonData = await seasonResponse.json();
        const episodes = seasonData.episodes;
        const today = new Date();
        episodeSelect.innerHTML = "";
        episodes.forEach((episode) => {
            const airDate = new Date(episode.air_date);
            if (airDate <= today && episode.episode_number > 0) {
                const option = document.createElement("option");
                option.value = episode.episode_number;
                option.textContent = `Episode ${episode.episode_number}`;
                episodeSelect.appendChild(option);
            }
        });
        const maxEpisode = episodeSelect.length;
        episodeSelect.value = maxEpisode;
        selectedEpisode = maxEpisode;
        episodeSelect.setAttribute("data-max-episodes", `${maxEpisode}`);

        servers(document.getElementById('selected').getAttribute('used'));
    } catch (error) {
        console.error('Erreur lors de la sélection du dernier épisode :', error);
    }
});

refresh.addEventListener('click', async () => {
        reader.src = reader.src;
});

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function setFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addFavorite(mediaType, mediaId) {
    const favorites = getFavorites();
    favorites.push({ media: mediaType.toLowerCase(), id: mediaId });
    setFavorites(favorites);
}

function removeFavorite(mediaType, mediaId) {
    let favorites = getFavorites();
    favorites = favorites.filter(favorite => !(favorite.media === mediaType.toLowerCase() && favorite.id === mediaId));
    setFavorites(favorites);
}

function isFavorite(mediaType, mediaId) {
    const favorites = getFavorites();
    return favorites.some(favorite => favorite.media === mediaType.toLowerCase() && favorite.id === mediaId);
}

function toggleFavorite(mediaType, mediaId) {
    if (isFavorite(mediaType.toLowerCase(), mediaId)) {
        removeFavorite(mediaType.toLowerCase(), mediaId);
    } else {
        addFavorite(mediaType.toLowerCase(), mediaId);
    }
    updateBookmarkIcon(mediaType.toLowerCase(), mediaId);
}

function updateBookmarkIcon(mediaType, mediaId) {
    const bookmarkIcon = document.getElementById('bookmark');
    if (isFavorite(mediaType, mediaId)) {
        bookmarkIcon.classList.remove('bi-bookmark');
        bookmarkIcon.classList.add('bi-bookmark-fill');
    } else {
        bookmarkIcon.classList.remove('bi-bookmark-fill');
        bookmarkIcon.classList.add('bi-bookmark');
    }
}

bookmarkIcon.addEventListener('click', function () {
    const mediaType = document.getElementById('mediatype').textContent;
    const mediaId = document.getElementById('mid').textContent;
    toggleFavorite(mediaType, mediaId);
});

window.addEventListener('load', getURLParameters);

//document.addEventListener("contextmenu", function(e) {
//    e.preventDefault();
//});
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
