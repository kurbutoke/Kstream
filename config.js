window.KSTREAM_CONFIG = {
  API_KEY: "a16ae8a9e473e167a27b616834d5be28",
  BEARER_TOKEN:
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTZhZThhOWU0NzNlMTY3YTI3YjYxNjgzNGQ1YmUyOCIsInN1YiI6IjY0ZGZhNGNkYTNiNWU2MDEzOTAxNmMzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MsTmKp7A_E7_IeiqVYfNVx-ZNzWlhECA_A4LESfHWbc",
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_URL: "https://image.tmdb.org/t/p",
  DOMAIN: window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')),
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
    name: "Videasy",
    movie: ({id}) => `https://player.videasy.net/movie/${id}`,
    tv: ({id, s, e}) => `https://player.videasy.net/tv/${id}/${s}/${e}`
  },
  {
    id: "S2",
    name: "VidLink",
    movie: ({id}) => `https://vidlink.pro/movie/${id}?primaryColor=00acc1`,
    tv: ({id, s, e}) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=00acc1`
  },
  {
    id: "S3",
    name: "Vidsrc",
    movie: ({id}) => `https://vidsrc.ru/movie/${id}`,
    tv: ({id, s, e}) => `https://vidsrc.ru/tv/${id}/${s}/${e}`
  },
  {
    id: "S4",
    name: "Frembed (VF)",
    movie: ({id}) => `https://frembed.one/embed/movie/${id}`,
    tv: ({id, s, e}) => `https://frembed.one/embed/serie/${id}?sa=${s}&epi=${e}`
  },
  {
    id: "CUSTOM",
    name: "Custom Server",
    movie: ({id}) => `CUSTOM:${id}`,
    tv: ({id, s, e}) => `CUSTOM:${id}:${s}:${e}`
  }
];

