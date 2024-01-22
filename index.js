const express = require('express');
const axios = require('axios');
const app = express();
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();});
const ip = '0.0.0.0';
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
app.use(cors());
app.use(express.static(__dirname));

const privateKey = fs.readFileSync('/etc/letsencrypt/live/kstream.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/kstream.net/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log('HTTP Server listening on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server listening on port 443');
});

app.get('/search/:text', async (req, res) => {
  const { text } = req.params;

  if (text.length === 0) {
    return res.status(400).json({ error: "The 'text' parameter cannot be empty." });
  }

  try {
    const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc"; // Remplacez par votre clé API TMDb
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${text}`,
      { method: "GET", headers: headers }
    );

    if (!response.ok) {
      throw new Error("Error");
    }

    const data = await response.json();
    const results = data.results.filter((item) => item.media_type === "tv" || item.media_type === "movie").slice(0, 5).map((item) => ({
    Poster: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}`: "",
    Title: item.title || item.name,
    Year: item.first_air_date ? item.first_air_date.slice(0, 4) : item.release_date.slice(0, 4),
    Percentage: Math.round(item.vote_average * 10),
    MediaType: item.media_type === "movie" ? "Movie" : "TV",
    Id: item.id,
  }));

res.status(200).json({ results });
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.get("/trending-movies", async (req, res) => {
  try {
    const apiKey = "a16ae8a9e473e167a27b616834d5be28";
    const apiUrl = `https://api.themoviedb.org/3/trending/movie/week?language=en-US&api_key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();
    const results = data.results.slice(0, 10).map((item) => ({
      Title: item.title,
      Poster: `https://image.tmdb.org/t/p/w400${item.poster_path}`,
      Release: item.release_date.split("-")[0],
      Id: item.id,
      Media: 'Movie',
    }));

    res.status(200).json({ results });
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.get("/trending-tv", async (req, res) => {
  try {
    const apiKey = "a16ae8a9e473e167a27b616834d5be28";
    const apiUrl = `https://api.themoviedb.org/3/trending/tv/week?language=en-US&api_key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();
    const results = data.results.slice(0, 10).map((item) => ({
      Title: item.name,
      Poster: `https://image.tmdb.org/t/p/w400${item.poster_path}`,
      Release: item.first_air_date.split("-")[0],
      Id: item.id,
      Media: 'TV',
    }));

    res.status(200).json({ results });
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.get("/movie/:mediaId", async (req, res) => {
  try {
    const mediaId = req.params.mediaId;
    const apiUrl = `https://api.themoviedb.org/3/movie/${mediaId}?append_to_response=credits&language=en-US`;
    const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
    const response = await axios.get(apiUrl, { headers });
    const item = response.data;
    const movieDetails = {
      Id: item.id,
      Poster: `https://image.tmdb.org/t/p/w400${item.poster_path}`,
      Back: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      Title: item.title,
      Overview: item.overview,
      Runtime: `${item.runtime} min`,
      Mediatype: 'Movie',
      Release: item.release_date,
      Vote: Math.round(item.vote_average * 10) / 10,
      Year: item.release_date.split("-")[0],
      Genres: item.genres.map((genre) => genre.name).join(", "),
      Director: item.credits.crew.find((member) => member.job === "Director").name,
      Production: item.production_companies.map((company) => company.name).join(", "),
      Country: item.production_countries.map((country) => country.name).join(", "),
      Cast: item.credits.cast.slice(0, 5).map((actor) => actor.name).join(", "),
    };

    res.json(movieDetails);
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.get("/tv/:mediaId", async (req, res) => {
  try {
    const mediaId = req.params.mediaId;
    const apiUrl = `https://api.themoviedb.org/3/tv/${mediaId}?append_to_response=credits&language=en-US`;
    const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
    const response = await axios.get(apiUrl, { headers });
    const item = response.data;
    const tvDetails = {
      Id: item.id,
      Poster: `https://image.tmdb.org/t/p/w400${item.poster_path}`,
      Back: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      Title: item.name,
      Overview: item.overview,
      Runtime: `${item.season_number}`,
      Mediatype: 'TV',
      Release: item.first_air_date,
      Vote: Math.round(item.vote_average * 10) / 10,
      Year: item.first_air_date.split("-")[0],
      Genres: item.genres.map((genre) => genre.name).join(", "),
      Director: item.credits.crew.find((member) => member.job === "Director"),
      Production: item.production_companies.map((company) => company.name).join(", "),
      Country: item.production_countries.map((country) => country.name).join(", "),
      Cast: item.credits.cast.slice(0, 5).map((actor) => actor.name).join(", "),
      S: item.number_of_seasons,
    };

    res.json(tvDetails);
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.get("/tv/:mediaId/:season", async (req, res) => {
  try {
    const mediaId = req.params.mediaId;
    const season = req.params.season;
    const apiUrl = `https://api.themoviedb.org/3/tv/${mediaId}/season/${season}`;
    const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
    const response = await axios.get(apiUrl, { headers });
    const item = response.data;

    const episodesArray = item.episodes.map((episode) => {
      const airDate = episode.air_date ? new Date(episode.air_date) : null;
      const currentDate = new Date();

      if (airDate === null || airDate <= currentDate) {
        return {
          episode: episode.episode_number,
          air_date: episode.air_date,
        };
      }
      return null;
    });

    const releasedEpisodes = episodesArray.filter((episode) => episode !== null && episode.air_date !== null);

    const movieDetails = {
      episodes: releasedEpisodes.length,
      episodesData: releasedEpisodes,
    };

    res.json(movieDetails);
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).json({ error: "Une erreur s'est produite lors du traitement de la demande." });
  }
});

app.get("/similar/:mediatype/:mediaId", async (req, res) => {
  try {
    const mediaId = req.params.mediaId;
    const mediatype = req.params.mediatype;
    const apiUrl = `https://api.themoviedb.org/3/${mediatype}/${mediaId}/similar`;
    const headers = {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",};
    const response = await axios.get(apiUrl, { headers });
    
    if (response.status === 200) {
      const item = response.data;
      const movieDetails = item.results.slice(0, 5).map((item) => ({
        Poster: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : "",
        Title: item.title || item.name,
        Year: item.first_air_date ? item.first_air_date.slice(0, 4) : item.release_date.slice(0, 4),
        Percentage: Math.round(item.vote_average * 10),
        MediaType: item.media_type === "movie" ? "Movie" : "TV",
        Id: item.id,
      }));

      res.json(movieDetails);
    } else {
      res.status(response.status).json({ error: "An error occurred while fetching data from the API." });
    }
  } catch (error) {
    console.error("An error has occurred:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});
