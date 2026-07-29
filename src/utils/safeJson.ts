export const safeJsonParse = <T = any>(
  value: string | null | undefined,
  fallback: T
): T => {
  if (!value || value === "undefined" || value === "null") {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON from storage:", value, error);
    return fallback;
  }
};
