const CAL = {
    grid: document.getElementById('calendar-grid'),
    monthTitle: document.getElementById('month-title'),
    prevBtn: document.getElementById('prev-month'),
    nextBtn: document.getElementById('next-month'),
    tabs: document.querySelectorAll('.calendar-tabs .tab-pill')
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentType = 'movie';
let isLoading = false;

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function renderSkeleton() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    CAL.grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell empty';
        CAL.grid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.innerHTML = `<div class="cell-day">${day}</div><div class="cell-releases"><div class="skeleton skeleton-release"></div></div>`;
        CAL.grid.appendChild(cell);
    }
}

async function loadCalendar() {
    if (isLoading) return;
    isLoading = true;

    CAL.monthTitle.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    renderSkeleton();

    const startDate = formatDate(currentYear, currentMonth, 1);
    const endDate = formatDate(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));

    const dateParam = currentType === 'movie'
        ? { 'primary_release_date.gte': startDate, 'primary_release_date.lte': endDate }
        : { 'first_air_date.gte': startDate, 'first_air_date.lte': endDate };

    const now = new Date();
    const isFuture = currentYear > now.getFullYear() || (currentYear === now.getFullYear() && currentMonth > now.getMonth());

    const params = {
        ...dateParam,
        sort_by: currentType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc',
        page: '1'
    };

    if (!isFuture) {
        params['vote_count.gte'] = '10';
    } else {
        params.with_original_language = 'en';
    }

    const data = await fetchTMDB(`/discover/${currentType}`, params);

    let page2Data = null;
    if (data && data.total_pages > 1) {
        page2Data = await fetchTMDB(`/discover/${currentType}`, { ...params, page: '2' });
    }

    const releases = {};
    const allResults = [
        ...(data?.results || []),
        ...(page2Data?.results || [])
    ];

    allResults.forEach(item => {
        const date = currentType === 'movie' ? item.release_date : item.first_air_date;
        if (!date) return;
        const day = parseInt(date.split('-')[2], 10);
        if (!releases[day]) releases[day] = [];
        releases[day].push(item);
    });

    renderCalendar(releases);
    isLoading = false;
}

function renderCalendar(releases) {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

    CAL.grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell empty';
        CAL.grid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        if (isCurrentMonth && today.getDate() === day) {
            cell.classList.add('today');
        }

        const dayLabel = document.createElement('div');
        dayLabel.className = 'cell-day';
        dayLabel.textContent = day;
        cell.appendChild(dayLabel);

        const releasesContainer = document.createElement('div');
        releasesContainer.className = 'cell-releases';

        if (releases[day] && releases[day].length > 0) {
            cell.classList.add('has-releases');
            releases[day].slice(0, 3).forEach(item => {
                const releaseEl = document.createElement('div');
                releaseEl.className = 'calendar-release';
                releaseEl.title = item.title || item.name;

                const img = document.createElement('img');
                img.src = item.poster_path
                    ? `${CONFIG.IMAGE_URL}/w92${item.poster_path}`
                    : './img/empty.png';
                img.alt = item.title || item.name;
                img.loading = 'lazy';

                const title = document.createElement('span');
                title.className = 'release-title';
                title.textContent = item.title || item.name;

                releaseEl.appendChild(img);
                releaseEl.appendChild(title);
                releaseEl.addEventListener('click', () => {
                    window.location.href = `player.html?media=${currentType}&id=${item.id}`;
                });
                releasesContainer.appendChild(releaseEl);
            });

            if (releases[day].length > 3) {
                const more = document.createElement('div');
                more.className = 'calendar-more';
                more.textContent = `+${releases[day].length - 3} more`;
                releasesContainer.appendChild(more);
            }
        }

        cell.appendChild(releasesContainer);
        CAL.grid.appendChild(cell);
    }
}

CAL.prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadCalendar();
});

CAL.nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadCalendar();
});

CAL.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        CAL.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentType = tab.dataset.type;
        loadCalendar();
    });
});

window.addEventListener('load', loadCalendar);
