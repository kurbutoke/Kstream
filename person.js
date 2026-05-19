const CONFIG = window.KSTREAM_CONFIG || {
    API_KEY: "",
    BEARER_TOKEN: "",
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_URL: "https://image.tmdb.org/t/p",
    DOMAIN: ""
};

const UTILS = window.KSTREAM_UTILS || {};

const UI = {
    image: document.getElementById("person-image"),
    name: document.getElementById("person-name"),
    department: document.getElementById("person-known-for-department"),
    biography: document.getElementById("person-biography"),
    birthday: document.getElementById("person-birthday"),
    placeOfBirth: document.getElementById("person-place-of-birth"),
    deathday: document.getElementById("person-deathday"),
    creditsItems: document.getElementById("credits-items")
};

let allCredits = [];

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
    const id = UTILS.safeNumber ? UTILS.safeNumber(urlParams.get('id')) : Number(urlParams.get('id'));

    if (id) {
        loadPerson(id);
    } else {
        window.location.href = 'index.html';
    }
}

async function loadPerson(personId) {
    const details = await fetchTMDB(`/person/${personId}`);
    if (!details) return;

    document.title = `${details.name} - Kstream`;
    
    UI.name.textContent = details.name;
    UI.department.textContent = details.known_for_department;
    
    const bioText = details.biography || "No biography available.";
    const maxChars = 500; // Maximum characters to show initially

    if (bioText.length > maxChars) {
        const truncatedText = bioText.slice(0, maxChars) + "...";

        UI.biography.innerHTML = "";
        const bioSpan = document.createElement("span");
        bioSpan.className = "bio-text";
        bioSpan.textContent = truncatedText;

        const readMoreBtn = document.createElement("span");
        readMoreBtn.className = "read-more-btn";
        readMoreBtn.textContent = "Read More";
        readMoreBtn.style.color = "var(--primary-color)";
        readMoreBtn.style.cursor = "pointer";
        readMoreBtn.style.marginLeft = "5px";
        readMoreBtn.style.fontWeight = "bold";

        readMoreBtn.onclick = () => {
            if (readMoreBtn.textContent === "Read More") {
                bioSpan.textContent = bioText;
                readMoreBtn.textContent = "Read Less";
            } else {
                bioSpan.textContent = truncatedText;
                readMoreBtn.textContent = "Read More";
            }
        };

        UI.biography.appendChild(bioSpan);
        UI.biography.appendChild(readMoreBtn);
    } else {
        UI.biography.textContent = bioText;
    }
    
    if (details.birthday) {
        const date = new Date(details.birthday);
        UI.birthday.textContent = date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (!details.deathday) {
            const ageDiffMs = Date.now() - date.getTime();
            const ageDate = new Date(ageDiffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            UI.birthday.textContent += ` (Age ${age})`;
        }
    } else {
         UI.birthday.textContent = "N/A";
    }

    if (details.deathday) {
        const date = new Date(details.deathday);
        UI.deathday.textContent = date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        UI.deathday.parentNode.style.display = "flex";
    } else {
        UI.deathday.parentNode.style.display = "none";
    }

    UI.placeOfBirth.textContent = details.place_of_birth || "N/A";
    
    if (details.profile_path) {
        UI.image.src = `${CONFIG.IMAGE_URL}/w342${details.profile_path}`;
    }

    const credits = await fetchTMDB(`/person/${personId}/combined_credits`);
    if (credits && credits.cast) {
        allCredits = credits.cast.sort((a, b) => b.popularity - a.popularity);
        
        const seen = new Set();
        allCredits = allCredits.filter(item => {
            const duplicate = seen.has(item.id);
            seen.add(item.id);
            return !duplicate;
        });

        renderCredits(allCredits);
    }
}

function renderCredits(items) {
    UI.creditsItems.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        if (item.poster_path) {
            fragment.appendChild(createMediaCard(item));
        }
    });
    
    if (fragment.children.length === 0) {
        UI.creditsItems.innerHTML = "<div class='no-results'>No credits found.</div>";
    } else {
        UI.creditsItems.appendChild(fragment);
    }
}

window.filterCredits = function(type, tab) {
    if (tab) {
        const siblings = tab.parentNode.children;
        for (let i = 0; i < siblings.length; i++) {
            siblings[i].classList.remove('active');
        }
        tab.classList.add('active');
    }

    if (type === 'all') {
        renderCredits(allCredits);
    } else {
        const filtered = allCredits.filter(item => item.media_type === type);
        renderCredits(filtered);
    }
};

function createMediaCard(item) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.style.cursor = "pointer";
    itemDiv.style.marginBottom = "20px";

    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || "N/A";
    const year = date.split("-")[0];
    const mediaType = item.media_type; 

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("poster");
    const posterLink = document.createElement("div");
    const posterImg = document.createElement("img");
    posterImg.draggable = false;
    posterImg.decoding = "async";
    posterImg.src = item.poster_path 
        ? `${CONFIG.IMAGE_URL}/w300${item.poster_path}` 
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
    if (item.character) {
        const role = document.createElement("div");
        role.style.fontSize = "0.8rem";
        role.style.color = "#a0a0a0";
        role.style.marginTop = "4px";
        role.textContent = `as ${item.character}`;
        metaSpan.appendChild(role);
    }
    metaDiv.appendChild(metaSpan);

    itemDiv.appendChild(posterDiv);
    itemDiv.appendChild(metaDiv);

    itemDiv.addEventListener("click", () => {
        window.location.href = `player.html?media=${mediaType}&id=${item.id}`;
    });

    return itemDiv;
}

window.addEventListener('load', getURLParameters);