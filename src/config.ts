export const API_BASE = import.meta.env.DEV
  ? "http://localhost:0000/api/"
  : (import.meta.env.VITE_API_BASE ?? "https://api.dbasesolutions.in/api/");

  // "http://localhost:0000/api/"