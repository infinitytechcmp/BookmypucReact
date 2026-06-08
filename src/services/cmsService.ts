const CMS_API_BASE_URL = 'https://bookmypuc.com/adminapi/api/v1';
export const CMS_IMAGE_BASE_URL = 'https://admin.bookmypuc.com/storage/';
const API_KEY = '5EHsCetQvu9qeXfRit07gG0xJjnfD11O';
const ACCESS_TOKEN = '1|pjmDent0aDtOUd4hN7zLvL3S80lnlyMPcMKgGrqlbcfafc7b';

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cache to prevent duplicate requests during the same session.
// This automatically clears when the user hits refresh (F5), so they always get fresh data.
const apiCache = new Map<string, { timestamp: number, data: any }>();

const fetchFromCMS = async (endpoint: string) => {
  const cacheKey = `cms_cache_${endpoint}`;
  
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY_MS)) {
    return cached.data;
  }

  try {
    const response = await fetch(`${CMS_API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-KEY": API_KEY,
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error(`CMS API Error: ${response.status} ${response.statusText}`);
      return { error: true, message: `Error: ${response.status}` };
    }

    const data = await response.json();
    
    apiCache.set(cacheKey, {
      timestamp: Date.now(),
      data: data
    });

    return data;
  } catch (error) {
    console.error('CMS Fetch Error:', error);
    return { error: true, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const cmsService = {
  getPages: () => fetchFromCMS('/pages'),
  getPageBySlug: (slug: string) => fetchFromCMS(`/pages/${slug}`),
  getMenuBySlug: (slug: string) => fetchFromCMS(`/menus/${slug}`),
  getSimpleSliders: () => fetchFromCMS('/simple-sliders'),
  getFaqs: () => fetchFromCMS('/faqs'),
  getThemeOptions: () => fetchFromCMS('/theme-options'),
  getPosts: () => fetchFromCMS('/posts'),
  getPostBySlug: (slug: string) => fetchFromCMS(`/posts/${slug}`),
  
  // Helper to construct absolute image URLs from relative DB paths
  getImageUrl: (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    // If it's already an absolute URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise prepend the storage URL
    // Remove any leading slash from the path so we don't end up with double slashes
    return `${CMS_IMAGE_BASE_URL}${imagePath.replace(/^\/+/, '')}`;
  }
};
