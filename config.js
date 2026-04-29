window.KSTREAM_CONFIG = {
  API_KEY: "a16ae8a9e473e167a27b616834d5be28",
  BEARER_TOKEN:
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_URL: "https://image.tmdb.org/t/p",
  DOMAIN: "https://kurbutoke.github.io/Kstream",
  APP_NAME: "Kstream"
};

window.KSTREAM_SERVERS = [
  {
    id: "AUTO",
    name: "Auto (Smart)",
    movie: ({id}) => `AUTO:${id}`,
    tv: ({id}) => `AUTO:${id}`
  },
  {
    id: "S1",
    name: "VidKing",
    movie: ({id}) => `https://vidking.net/embed/movie/${id}?autoplay=1`,
    tv: ({id, s, e}) => `https://vidking.net/embed/tv/${id}/${s}/${e}?autoplay=1`
  },
  {
    id: "S2",
    name: "Videasy",
    movie: ({id}) => `https://player.videasy.net/movie/${id}`,
    tv: ({id, s, e}) => `https://player.videasy.net/tv/${id}/${s}/${e}`
  },
  {
    id: "S3",
    name: "Vidsrc.to",
    movie: ({id}) => `https://vidsrc.to/embed/movie/${id}`,
    tv: ({id, s, e}) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: "S4",
    name: "MultiEmbed",
    movie: ({id}) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: ({id, s, e}) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    id: "S5",
    name: "Frembed",
    movie: ({id}) => `https://frembed.ink/api/film.php?id=${id}`,
    tv: ({id, s, e}) => `https://frembed.ink/api/serie.php?id=${id}&sa=${s}&epi=${e}`
  },
  {
    id: "CUSTOM",
    name: "Custom Server",
    movie: ({id}) => `CUSTOM:${id}`,
    tv: ({id, s, e}) => `CUSTOM:${id}:${s}:${e}`
  }
];

