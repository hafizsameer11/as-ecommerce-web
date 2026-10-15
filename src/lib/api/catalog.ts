import { apiRequest, apiRequestWithMeta } from "./client";

export type ApiProductCard = {
  id: string;
  productId?: string;
  brand: string;
  brandHandle?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPct?: number | null;
  priceOnRequest?: boolean;
  image: string | null;
  category: string;
  categoryName?: string;
  subcategory?: string | null;
  subcategoryHandle?: string | null;
  sizes: string[];
  sizeAvailability?: Record<string, boolean>;
  colors: { name: string; hex: string }[];
  availability: string;
  isConcierge?: boolean;
  outOfStock?: boolean;
  rating?: { average: number; count: number };
  drop?: { id: string; releaseAt: string } | null;
};

export type ApiProductDetail = ApiProductCard & {
  description?: string | null;
  features?: string[];
  styleCode?: string | null;
  gallery?: { url: string; alt?: string | null; color?: string | null }[];
  sizeLabels?: Record<string, string>;
  modelFit?: string | null;
};

export type HomePayload = {
  hero?: Array<{
    id: string;
    eyebrow?: string;
    headline?: string;
    subhead?: string;
    cta?: string;
    linkTo?: string;
    imageUrl?: string;
    imageColor?: string;
  }>;
  categories?: Array<{ id?: string; handle?: string; name: string; image?: string | null }>;
  bestSellers?: ApiProductCard[];
  trending?: ApiProductCard[];
  newArrivals?: ApiProductCard[];
};

export type ProductListQuery = {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  size?: string;
  color?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  concierge?: boolean;
  inStock?: boolean;
  collection?: string;
  ids?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type ProductListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  pageCount?: number;
};

export type ProductFacets = {
  total: number;
  brands: Array<{ handle: string; name?: string; count: number }>;
  sizes: Array<{ size: string; count: number }>;
  colors: Array<{ name: string; hex?: string; count: number }>;
  availability: Array<{ key: string; count: number }>;
  priceRanges: Array<{ id: string; label: string; min: number; max: number | null; count: number }>;
  priceMin: number;
  priceMax: number;
};

export type ApiCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  featured?: boolean;
  slot?: string;
  products: ApiProductCard[];
};

export type ApiReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  size?: string | null;
  fit?: string | null;
  photos?: string[];
  reply?: { body: string; author?: string | null; at?: string | null } | null;
};

export type ReviewsPayload = {
  items: ApiReview[];
  summary: {
    average: number;
    count: number;
    distribution: Array<{ star: number; count: number }>;
    fit: Array<{ key: string; label: string; count: number }>;
  };
};

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const catalogApi = {
  home: () => apiRequest<HomePayload>("/store/home"),

  listProducts: async (query: ProductListQuery = {}) => {
    const { data, meta } = await apiRequestWithMeta<ApiProductCard[]>(
      `/store/products${qs(query as Record<string, string | number | boolean | undefined>)}`
    );
    return { items: data ?? [], meta: (meta ?? {}) as ProductListMeta };
  },

  facets: (query: ProductListQuery = {}) =>
    apiRequest<ProductFacets>(
      `/store/products/facets${qs(query as Record<string, string | number | boolean | undefined>)}`
    ),

  getProduct: (id: string) => apiRequest<ApiProductDetail>(`/store/products/${encodeURIComponent(id)}`),

  related: (id: string, limit = 4) =>
    apiRequest<ApiProductCard[]>(`/store/products/${encodeURIComponent(id)}/related${qs({ limit })}`),

  alsoLike: (exclude: string[], limit = 8) =>
    apiRequest<ApiProductCard[]>(`/store/products/also-like${qs({ exclude: exclude.join(","), limit })}`),

  search: (q: string, limit = 48) =>
    apiRequest<{
      query: string;
      total: number;
      products: ApiProductCard[];
      brands?: Array<{ handle: string; name: string }>;
      categories?: Array<{ handle: string; name: string }>;
    }>(`/store/search${qs({ q, limit })}`),

  suggest: (q: string) =>
    apiRequest<{
      products: Array<{ id: string; name: string; brand: string }>;
      brands: Array<{ handle: string; name: string }>;
    }>(`/store/search/suggest${qs({ q })}`),

  popularSearches: () => apiRequest<string[]>("/store/search/popular"),

  categories: () =>
    apiRequest<Array<{ id: string; handle: string; name: string; image?: string | null; itemCount?: number }>>(
      "/store/categories"
    ),

  brands: () =>
    apiRequest<Array<{ id: string; handle: string; name: string; itemCount?: number; image?: string | null }>>(
      "/store/brands"
    ),

  getBrand: (id: string) =>
    apiRequest<{ id: string; handle: string; name: string; itemCount?: number; image?: string | null }>(
      `/store/brands/${encodeURIComponent(id)}`
    ),

  getCollection: (id: string) =>
    apiRequest<ApiCollection>(`/store/collections/${encodeURIComponent(id)}`),

  collectionsBySlot: (slot: string) =>
    apiRequest<ApiCollection[]>(`/store/collections${qs({ slot })}`),

  /** Brand guide wins over category when both match. */
  sizeGuides: (query: { brand?: string; category?: string } = {}) =>
    apiRequest<
      Array<{
        id: string;
        scope: "brand" | "category";
        target: string;
        note: string;
        chartUrl?: string | null;
      }>
    >(`/store/size-guides${qs(query)}`),

  listReviews: (productId: string, query: { page?: number; pageSize?: number; sort?: string; rating?: number } = {}) =>
    apiRequestWithMeta<ReviewsPayload>(
      `/store/products/${encodeURIComponent(productId)}/reviews${qs(query as Record<string, string | number | boolean | undefined>)}`
    ),

  createReview: async (
    productId: string,
    fields: { rating: number; title: string; body: string; size?: string; fit?: string },
    photos?: File[]
  ) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (v === undefined || v === "") continue;
      fd.append(k, String(v));
    }
    for (const f of photos ?? []) fd.append("photos", f);
    return apiRequest<ApiReview & { status?: string; message?: string }>(
      `/store/products/${encodeURIComponent(productId)}/reviews`,
      { method: "POST", rawBody: fd }
    );
  },

  markReviewHelpful: (reviewId: string) =>
    apiRequest<{ counted: boolean }>(`/store/reviews/${encodeURIComponent(reviewId)}/helpful`, {
      method: "POST",
      body: {},
    }),

  reportReview: (reviewId: string) =>
    apiRequest<{ counted: boolean }>(`/store/reviews/${encodeURIComponent(reviewId)}/report`, {
      method: "POST",
      body: {},
    }),

  notifyMe: (productId: string, size?: string) =>
    apiRequest(`/store/products/${encodeURIComponent(productId)}/notify-me`, {
      method: "POST",
      body: size ? { size } : {},
    }),

  stopNotifyMe: (productId: string, size?: string) =>
    apiRequest(`/store/products/${encodeURIComponent(productId)}/notify-me${qs({ size })}`, {
      method: "DELETE",
    }),
};
