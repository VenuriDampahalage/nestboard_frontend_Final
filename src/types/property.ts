export type Property = {
  id: string
  title: string
  location: string
  type: "House" | "Villa" | "Apartment" | "Hotel"
  price: string
  rating: number
  image: string
  lat: number
  lng: number
}
export type Room = {
  id: string
  name: string
  price: string
  seatsTotal: number
  seatsFree: number
  hasAC: boolean
}

export type PropertyDetail = {
  id: string
  title: string
  address: string
  amenities: string[]
  rating: number
  seatsAvailable: number
  minStay: string
  startingPrice: string
  image: string
  rooms: Room[]
}

export type SortByOption = "price" | "rating" | "recency"
export type SortOrderOption = "asc" | "desc"

export type PropertyFilterParams = {
  search?: string
  type?: Property["type"] | "All"
  city?: string
  minPrice?: number | string
  maxPrice?: number | string
  minRating?: number | string
  sortBy?: SortByOption
  sortOrder?: SortOrderOption
  page?: number
  limit?: number
}

export type PaginationMetadata = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore?: boolean
}

export type PaginatedPropertiesResponse = {
  data: Property[]
  pagination: PaginationMetadata
}

