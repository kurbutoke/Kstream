# Kstream - Free Movies & TV Streaming

[![Visit Kstream](https://img.shields.io/badge/Visit-Kstream-00acc1?style=for-the-badge&logo=google-chrome&logoColor=white)](https://kurbutoke.github.io/Kstream/)

**Kstream** is a modern, responsive, and ad-free streaming web application that allows users to watch their favorite movies and TV without registration. Built with vanilla HTML, CSS, and JavaScript, it leverages the TMDb API for content metadata and multiple streaming providers for video playback.

![Home Page](./img/screenshots/home.png)

## ✨ Features

-   **🎬 Massive Library**: Access to thousands of Movies and TV via The Movie Database (TMDb) API.
-   **🚫 No Registration Required**: Start watching immediately without creating an account.
-   **📱 Fully Responsive**: Optimized for Desktop, Tablet, and Mobile devices.
-   **🔍 Smart Search**: Instant search with auto-suggestions for movies, shows, and actors.
-   **⚡ Multi-Server Support**: Choose from up to 5 different streaming servers (VidKing, Videasy, Vidsrc, etc.) to ensure availability.
-   **💾 Local Library**:
    -   **Favorites**: Save movies and shows to your "My Library" list.
    -   **Watch History**: Automatically saves your progress and history so you can resume where you left off.
-   **🎭 Browse Categories**: Filter content by genres (Action, Comedy, Sci-Fi, etc.) or check "Trending" and "Top Rated" lists.
-   **👤 Cast & Crew**: Detailed information about actors including their other works.
-   **🔐 Privacy Focused**: No personal data collection, everything is stored locally in your browser.

## 🚀 How It Works

Kstream serves as a sophisticated frontend interface. It does not host any content itself but aggregates metadata from TMDb and embeds video players from third-party APIs.

1.  **Discovery**: Browse trending content or search for specific titles.
2.  **Selection**: Click on a title to view details (Rating, Plot, Cast).
3.  **Playback**: The improved player automatically selects a working server. You can switch servers manually if needed.
4.  **Tracking**: Your watch progress is saved locally.

## 📸 Screenshots

### Player Interface
![Player Interface](./img/screenshots/player.png)

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3 (Custom Design System), JavaScript (ES6+)
-   **API**: [The Movie Database (TMDb)](https://www.themoviedb.org/)
-   **Icons**: Bootstrap Icons
-   **Fonts**: Google Fonts (Work Sans)

## 📦 Installation / Local Development

If you want to run this locally:

1.  Clone the repository:
    ```bash
    git clone https://github.com/kurbutoke/Kstream.git
    cd Kstream
    ```

2.  Serve the files using a simple HTTP server (e.g., Python or Node.js extension):
    ```bash
    # Python 3
    python3 -m http.server 8000
    ```

3.  Open `http://localhost:8000` in your browser.

## ⚠️ Disclaimer

This project is for educational purposes only. Kstream does not host any files on its server. All content is provided by non-affiliated third parties.

---

Made with ❤️ by Kurd
