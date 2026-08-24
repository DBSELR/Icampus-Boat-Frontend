// Frontend Storage & File System Manager for Student Photo & Signature (Stu_Photo_Sign)
// Saves and retrieves files directly inside src/pages/Admissions/Stu_Photo_Sign with instant Vite glob & IndexedDB caching.

const DB_NAME = "ICampus_Stu_Photo_Sign_DB";
const STORE_NAME = "Stu_Photo_Sign";
const DB_VERSION = 1;

// Vite glob import to resolve any image directly inside Stu_Photo_Sign
const localMediaFiles: Record<string, any> = (import.meta as any).glob(
  "/src/pages/Admissions/Stu_Photo_Sign/*",
  { eager: true, query: "?url", import: "default" }
);

/**
 * Open or initialize the IndexedDB instance for Stu_Photo_Sign
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update a photo or signature directly into src/pages/Admissions/Stu_Photo_Sign folder
 * and IndexedDB storage.
 * Key convention:
 * - Photo: P-[Admission No]
 * - Signature: S-[Admission No]
 */
export async function savePhotoSign(key: string, dataUrl: string): Promise<void> {
  if (!key || !dataUrl) return;
  const cleanKey = key.trim();

  // Only save if it's a newly uploaded base64 DataURL (do not overwrite existing files with URL paths)
  if (!dataUrl.startsWith("data:")) {
    return;
  }

  // 1. Physically write / update the file into src/pages/Admissions/Stu_Photo_Sign folder
  try {
    const filename = `${cleanKey}.jpg`;
    await fetch("/api/save-photo-sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        base64: dataUrl,
      }),
    });
  } catch (fsErr) {
    console.warn("Notice saving to Stu_Photo_Sign filesystem:", fsErr);
  }

  // 2. Save in IndexedDB / localStorage for instant local client persistence
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, cleanKey.toLowerCase());
      store.put(dataUrl, cleanKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    try {
      localStorage.setItem(`Stu_Photo_Sign_${cleanKey.toLowerCase()}`, dataUrl);
    } catch (localErr) {
      console.error("Failed to store image in localStorage:", localErr);
    }
  }
}

/**
 * Retrieve a stored photo or signature by key (e.g. P-[AdmNo] or S-[AdmNo])
 * Checks Vite static glob map first, then Stu_Photo_Sign API, then IndexedDB & localStorage.
 */
export async function getPhotoSign(key: string): Promise<string | null> {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase();

  // 1. Check Vite eager glob map for files inside Stu_Photo_Sign
  try {
    for (const [path, url] of Object.entries(localMediaFiles)) {
      const filename = path.split("/").pop() || "";
      const baseName = (filename.substring(0, filename.lastIndexOf(".")) || filename).toLowerCase();
      if (baseName === cleanKey) {
        return typeof url === "string" ? `${url}` : `${path}`;
      }
    }
  } catch (e) {}

  // 2. Check direct static path
  try {
    const directUrl = `/src/pages/Admissions/Stu_Photo_Sign/${key.trim()}.jpg`;
    const checkDirect = await fetch(directUrl, { method: "HEAD" });
    if (checkDirect.ok) {
      return `${directUrl}?t=${Date.now()}`;
    }
  } catch (e) {}

  // 3. Check /api/check-photo-sign endpoint
  try {
    const response = await fetch(`/api/check-photo-sign?prefix=${encodeURIComponent(key.trim())}`);
    if (response.ok) {
      const data = await response.json();
      if (data?.exists && data?.url) {
        return `${data.url}&t=${Date.now()}`;
      }
    }
  } catch (checkErr) {
    console.warn("Notice checking Stu_Photo_Sign API:", checkErr);
  }

  // 4. Check IndexedDB
  try {
    const db = await openDB();
    const result = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanKey);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          const reqUpper = store.get(key.trim());
          reqUpper.onsuccess = () => resolve(reqUpper.result || null);
          reqUpper.onerror = () => resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
    if (result) return result;
  } catch (e) {}

  // 5. Check localStorage fallback
  try {
    const local = localStorage.getItem(`Stu_Photo_Sign_${cleanKey}`) || localStorage.getItem(`Stu_Photo_Sign_${key.trim()}`);
    if (local) return local;
  } catch (e) {}

  return null;
}

/**
 * Check if a photo or signature exists in frontend storage for a key
 */
export async function hasPhotoSign(key: string): Promise<boolean> {
  const result = await getPhotoSign(key);
  return Boolean(result);
}

/**
 * Convert a File or Blob to Base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
