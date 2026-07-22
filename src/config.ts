// export const API_BASE = import.meta.env.DEV
//   ? "https://localhost:7034/api"
//   : (import.meta.env.VITE_API_BASE ?? "https://test.dbasesolutions.in/api/");

//   // "http://localhost:0000/api/"

//   // /API_BASE



export const API_BASE = import.meta.env.DEV
    ? "https://localhost:7034/api/"
  : import.meta.env.VITE_API_BASE ?? "https://test.dbasesolutions.in/api/";

