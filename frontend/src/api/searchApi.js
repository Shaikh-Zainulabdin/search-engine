const BASE_URL = "https://search-engine-0bgs.onrender.com";

/**
 * Fetches search results from the backend.
 * @param {string} query - The user's search term.
 * @param {string} category - Category filter (general, it, science, news).
 * @param {number} limit - Max number of results to return.
 * @returns {Promise<Array>} Array of result objects.
 */
export async function searchApi(query, category = "general", limit = 10) {
  const params = new URLSearchParams({ q: query, limit, category });
  const response = await fetch(`${BASE_URL}/search?${params}`);

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
