const items = document.getElementById("items");
const headers = new Headers();
const body = document.body;
const nameElement = document.getElementById("name");
const image = document.getElementById("image");
const readerbg = document.getElementById("reader-bg");
const reader = document.getElementById("reader");
const mediatype = document.getElementById("mediatype");
const type = document.getElementById("type");
const grade = document.getElementById("grade");
const released = document.getElementById("released");
const duration = document.getElementById("duration");
const description = document.getElementById("description");
const country = document.getElementById("country");
const genres = document.getElementById("genres");
const releasedate = document.getElementById("release-date");
const director = document.getElementById("director");
const production = document.getElementById("production");
const cast = document.getElementById("cast");
const seasonEpisodeSelection = document.getElementById("season-episode-selection");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");
const mid = document.getElementById("mid");
const next = document.getElementById('next');
const bookmarkIcon = document.getElementById('bookmark');

let selectedSeriesId = null;
let selectedSeason = null;
let selectedEpisode = null;

function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    var tvParam = urlParams.get('media');
    var idParam = urlParams.get('id');
    load(tvParam, idParam);
}

async function load(MediaType, itemId) {
    const baseUrl = 'https://kstream.net';
    try {
        const response = await fetch(`${baseUrl}/${MediaType}/${itemId}`, {});
        const data = await response.json();
        reader.style.display = "flex";
        nameElement.textContent = data.Title;
        image.src = data.Poster === "https://image.tmdb.org/t/p/originalnull" ? `https://kstream.net/img/empty.png` : `${data.Poster}`;
        readerbg.style.backgroundImage = `url("${data.Back}")`;
        reader.src = MediaType === "movie" ? `https://vidsrc.to/embed/movie/${data.Id}` : `https://vidsrc.to/embed/tv/${data.Id}/1/1`;
        document.getElementById('selected').setAttribute("used", "S1");
        reader.style.display = "block";
        mediatype.textContent = MediaType === "movie" ? "Movie" : "TV";
        mid.textContent = itemId;
        type.textContent = MediaType === "movie" ? "Movie" : "TV";
        grade.textContent = data.Vote;
        released.textContent = data.Year;
        duration.textContent = data.Runtime;
        description.textContent = data.Overview;
        country.textContent = data.Country;
        genres.textContent = data.Genres;
        const options = {year: "numeric",month: "short",day: "2-digit"};
        const formattedDate = new Date(data.Release).toLocaleDateString("en-US", options);
        releasedate.textContent = formattedDate;
        director.textContent = data.Director;
        production.textContent = data.Production;
        cast.textContent = data.Cast;
        if (MediaType === "tv") {
            document.getElementById("boom").style.display = "none";
            items.style.display = "contents";
            if (data.S > 0) {
                seasonSelect.innerHTML = "";
                for (let i = 1; i <= data.S; i++) {
                    const option = document.createElement("option");
                    option.value = i;
                    option.textContent = `Season ${i}`;
                    seasonSelect.setAttribute("data-max-seasons", `${data.S}`);
                    seasonSelect.appendChild(option);
                    duration.textContent = i > 1 ? `${i} Seasons` : `${i} Season`;
                }
            }
            const response = await fetch(`${baseUrl}/tv/${data.Id}/1`, {});
            const item = await response.json();
            for (let i = 1; i <= item.episodes; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = `Episode ${i}`;
                episodeSelect.setAttribute("data-max-episodes", `${item.episodes}`);
                episodeSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error", error);
    }
};

async function getSeasonsAndEpisodes(itemId) {
    const baseUrl = 'https://kstream.net';
    try {
        const response = await fetch(`${baseUrl}/tv/${itemId}`, {}
        );

        const data = await response.json();
        const numberOfSeasons = data.number_of_seasons;

        if (numberOfSeasons > 0) {
            seasonSelect.innerHTML = "";
            for (let i = 1; i <= numberOfSeasons; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = `Season ${i}`;
                seasonSelect.setAttribute("data-max-seasons", `${numberOfSeasons}`);
                seasonSelect.appendChild(option);
                if (i > 1) {
                    duration.textContent = `${i} Seasons`;
                } else {
                    duration.textContent = `${i} Season`;
                }
            }
            seasonEpisodeSelection.style.display = "contents";
        }
    } catch (error) {
        console.error(
            "Error",
            error
        );
    }
};

seasonSelect.addEventListener("change", async () => {
    selectedSeason = seasonSelect.value;
    const baseUrl = 'https://kstream.net';
    try {
        const response = await fetch(`${baseUrl}/tv/${mid.innerText}/${selectedSeason}`);

        if (!response.ok) {
            throw new Error(`Fetch request failed with status: ${response.status}`);
        }
        const data = await response.json();
        episodeSelect.innerHTML = "";
        for (let i = 1; i <= data.episodes; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `Episode ${i}`;
            episodeSelect.setAttribute("data-max-episodes", `${data.episodes}`);
            episodeSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error', error);
    }
});

function generateAndCopyLink() {
    const mediaElement = document.getElementById('mediatype');
    const midElement = document.getElementById('mid');
    const media = mediaElement.textContent;
    const id = midElement.textContent;
    const linkURL = media ==="Movie" ? `https://kstream.net/0.html?media=movie&id=${id}` : `https://kstream.net/0.html?media=tv&id=${id}`;
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

function toggleFavorite(mediaType, mediaId) {
    const favorites = getFavorites();
    const favoriteIndex = favorites.findIndex(favorite => favorite.media === mediaType && favorite.id === mediaId);
    if (favoriteIndex !== -1) {
        favorites.splice(favoriteIndex, 1);
    } else {
        favorites.push({ media: mediaType, id: mediaId });
    }
    setFavorites(favorites);
    updateBookmarkIcon(mediaType, mediaId);
}

function getFavorites() {
    const favoritesStorage = localStorage.getItem('favorites');
    return favoritesStorage ? JSON.parse(favoritesStorage) : [];
}

function setFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateBookmarkIcon(mediaType, mediaId) {
    const bookmarkIcon = document.getElementById('bookmark');
    const favorites = getFavorites();
    const isFavorite = favorites.some(favorite => 
        favorite.media.toLowerCase() === mediaType.toLowerCase() && 
        favorite.id === mediaId
    );
    if (isFavorite) {
        bookmarkIcon.classList.remove('bi-bookmark');
        bookmarkIcon.classList.add('bi-bookmark-fill');
    } else {
        bookmarkIcon.classList.remove('bi-bookmark-fill');
        bookmarkIcon.classList.add('bi-bookmark');
    }
}

function servers(serv) {
    const urlParams = new URLSearchParams(window.location.search);
    const media = urlParams.get('media');

    if (media === "movie") {
        if (serv === "S1"){
            const streamingURL = `https://vidsrc.to/embed/movie/${mid.innerText}`;
            reader.src = streamingURL;
        }
        if (serv === "S2"){
            const streamingURL = `https://vidsrc.me/embed/movie?tmdb=${mid.innerText}&color=00acc1`;
            reader.src = streamingURL;
        }
        if (serv === "S3"){
            const streamingURL = `https://multiembed.mov/?video_id=${mid.innerText}&tmdb=1`;
            reader.src = streamingURL;
        }
        if (serv === "S4"){
            const streamingURL = `https://frembed.com/api/film.php?id=${mid.innerText}`;
            reader.src = streamingURL;
        }
    }
    else {
        if (serv === "S1"){
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            const streamingURL = `https://vidsrc.to/embed/tv/${mid.innerText}/${s}/${e}`;
            reader.src = streamingURL;
            reader.style.display = "block";
            document.getElementById('selected').setAttribute("used", "S1");
        }
        if (serv === "S2"){
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            const streamingURL = `https://vidsrc.me/embed/tv?tmdb=${mid.innerText}&season=${s}&episode=${e}&color=00acc1`;
            reader.src = streamingURL;
            reader.style.display = "block";
            document.getElementById('selected').setAttribute("used", "S2");
        }
        if (serv === "S3"){
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            const streamingURL = `https://multiembed.mov/?video_id=${mid.innerText}&tmdb=1&s=${s}&e=${e}`;
            reader.src = streamingURL;
            reader.style.display = "block";
            document.getElementById('selected').setAttribute("used", "S3");
        }
        if (serv === "S4"){
            s = document.getElementById('seasonSelect').value;
            e = document.getElementById('episodeSelect').value;
            const streamingURL = `https://frembed.com/api/serie.php?id=${mid.innerText}&sa=${s}&epi=${e}`;
            reader.src = streamingURL;
            reader.style.display = "block";
            document.getElementById('selected').setAttribute("used", "S4");
        }
    }
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

bookmarkIcon.addEventListener('click', function () {
    const mediaType = document.getElementById('mediatype').textContent;
    const mediaId = document.getElementById('mid').textContent;
    toggleFavorite(mediaType, mediaId);
});

window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const mediaType = urlParams.get('media');
    const mediaId = urlParams.get('id');
    updateBookmarkIcon(mediaType, mediaId);
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