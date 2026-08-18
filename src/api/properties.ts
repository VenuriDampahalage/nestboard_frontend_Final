import type {
  Property,
  PropertyDetail,
  PropertyFilterParams,
  PaginatedPropertiesResponse,
} from "@/types/property"

export async function fetchProperties(
  params: PropertyFilterParams = {}
): Promise<PaginatedPropertiesResponse> {
  const queryParams = new URLSearchParams()

  if (params.search?.trim()) queryParams.set("search", params.search.trim())
  if (params.type && params.type !== "All") queryParams.set("type", params.type)
  if (params.city?.trim()) queryParams.set("city", params.city.trim())
  if (params.minPrice !== undefined && params.minPrice !== "")
    queryParams.set("minPrice", String(params.minPrice))
  if (params.maxPrice !== undefined && params.maxPrice !== "")
    queryParams.set("maxPrice", String(params.maxPrice))
  if (params.minRating !== undefined && params.minRating !== "")
    queryParams.set("minRating", String(params.minRating))
  if (params.sortBy) queryParams.set("sortBy", params.sortBy)
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder)
  if (params.page !== undefined) queryParams.set("page", String(params.page))
  if (params.limit !== undefined) queryParams.set("limit", String(params.limit))

  const queryString = queryParams.toString()
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/properties${
    queryString ? `?${queryString}` : ""
  }`

  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch properties")
  const json = await res.json()

  const rawList: any[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : []

  const mappedData: Property[] = rawList.map((item: any) => ({
    id: String(item.id),
    title: item.title || "Untitled Property",
    location: item.location || item.address || item.city || "",
    type: item.type || "Apartment",
    price: item.price || item.cost || (item.startingPrice ? `$${item.startingPrice}/mo` : "$0"),
    rating: typeof item.rating === "string" ? parseFloat(item.rating) : (item.rating ?? 0),
    image: item.image || item.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    lat: item.lat ?? item.latitude ?? 6.9271,
    lng: item.lng ?? item.longitude ?? 79.8612,
  }))

  const rawPagination = json?.pagination || json?.meta
  const currentPage = Number(rawPagination?.page || params.page || 1)
  const currentLimit = Number(rawPagination?.limit || params.limit || 6)
  const totalItems = Number(
    rawPagination?.total ?? (Array.isArray(json) ? json.length : mappedData.length)
  )
  const calculatedTotalPages =
    rawPagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / currentLimit))

  return {
    data: mappedData,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: totalItems,
      totalPages: calculatedTotalPages,
      hasMore: currentPage < calculatedTotalPages,
    },
  }
}


export async function fetchPropertyDetail(id: string): Promise<PropertyDetail> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch property: ${id}`)
  const json = await res.json()
  const raw = json?.data ?? json

  return {
    id: raw.id,
    title: raw.title,
    address: raw.address || raw.location || "",
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    rating: typeof raw.rating === "string" ? parseFloat(raw.rating) : (raw.rating ?? 0),
    seatsAvailable: raw.seatsAvailable ?? raw.available_seats ?? 0,
    minStay: raw.minStay || "",
    startingPrice: raw.startingPrice || raw.cost || "",
    image: raw.image || raw.imageUrl || "",
    rooms: Array.isArray(raw.rooms) ? raw.rooms : [],
  }
}


