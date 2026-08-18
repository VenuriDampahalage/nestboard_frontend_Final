import type { Property, PropertyDetail } from "@/types/property"

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties`)
  if (!res.ok) throw new Error("Failed to fetch properties")
  const json = await res.json()

  const rawList: any[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : []

  return rawList.map((item: any) => ({
    id: item.id,
    title: item.title,
    location: item.location || item.address || "",
    type: item.type,
    price: item.price || item.cost || "",
    rating: typeof item.rating === "string" ? parseFloat(item.rating) : (item.rating ?? 0),
    image: item.image || item.imageUrl || "",
    lat: item.lat ?? item.latitude ?? 0,
    lng: item.lng ?? item.longitude ?? 0,
  }))
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


