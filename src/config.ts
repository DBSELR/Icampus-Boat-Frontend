// export const API_BASE = import.meta.env.DEV
//   ? "https://localhost:7034/api"
//   : (import.meta.env.VITE_API_BASE ?? "https://test.dbasesolutions.in/api/");

//   // "http://localhost:0000/api/"

//   // /API_BASE



<<<<<<< Updated upstream
export const API_BASE = import.meta.env.DEV
    ? "https://localhost:7034/api/"
  : import.meta.env.VITE_API_BASE ?? "https://test.dbasesolutions.in/api/";

=======
// export const API_BASE = import.meta.env.DEV
//   ? 
//    "https://localhost:7034/api/"
//    : import.meta.env.VITE_API_BASE ?? "https://test.dbasesolutions.in/api/";


const configuredBase = (import.meta.env.VITE_API_BASE ??
   (import.meta.env.DEV ? "https://localhost:7034/api/" : "https://test.dbasesolutions.in/api/")) as string;

export const API_BASE = configuredBase.endsWith("/") ?
 configuredBase : `${configuredBase}/`;
>>>>>>> Stashed changes
