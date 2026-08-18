import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useProperties } from "@/hooks/useProperties"
import type { Property } from "@/types/property"
import { Building2, Home as HouseIcon, Hotel, MapPin, Star } from "lucide-react"

// Fix default leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

export default function MapPage() {
  const { data: rawProperties = [], isLoading, isError } = useProperties()
  const properties = Array.isArray(rawProperties) ? rawProperties : []

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  const filteredProperties = properties.filter((property) => {
    const matchesCategory = activeCategory === "All" || property.type === activeCategory
    const matchesSearch =
      searchQuery === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    // Center near Colombo, Sri Lanka
    const map = L.map(mapContainerRef.current, {
      center: [6.9147, 79.8733],
      zoom: 12,
      zoomControl: false,
    })

    L.control.zoom({ position: "bottomright" }).addTo(map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    if (filteredProperties.length === 0) return

    const bounds = L.latLngBounds([])

    filteredProperties.forEach((property) => {
      // Default to Colombo center offset if lat/lng missing or invalid
      const lat = property.lat || 6.9271
      const lng = property.lng || 79.8612

      bounds.extend([lat, lng])

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            background: #f97316;
            color: white;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
            white-space: nowrap;
            border: 2px solid white;
            cursor: pointer;
            transition: transform 0.2s;
          " class="hover:scale-110">
            ${property.price}
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

      marker.on("click", () => {
        setSelectedProperty(property)
        map.flyTo([lat, lng], 14, { duration: 1 })
      })

      markersRef.current[property.id] = marker
    })

    if (filteredProperties.length > 0 && !selectedProperty) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    }
  }, [filteredProperties, selectedProperty])

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
    const map = mapInstanceRef.current
    if (map) {
      const lat = property.lat || 6.9271
      const lng = property.lng || 79.8612
      map.flyTo([lat, lng], 14, { duration: 1 })
    }
  }

  const categories = ["All", "Apartment", "House", "Villa", "Hotel"]

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-100 pt-16">
      {/* Sidebar Panel */}
      <div className="z-10 flex w-full flex-col border-r border-gray-200 bg-white shadow-xl sm:w-[420px]">
        {/* Header & Filter Controls */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Map View</h1>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {filteredProperties.length} spaces
            </span>
          </div>

          {/* Search Input */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-800 transition focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Property List Sidebar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="py-12 text-center text-sm text-gray-400">
              Loading properties on map...
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-sm text-red-500">
              Failed to load properties. Check backend connection.
            </div>
          )}

          {!isLoading && !isError && filteredProperties.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              No properties match your filter.
            </div>
          )}

          {filteredProperties.map((property) => {
            const isSelected = selectedProperty?.id === property.id
            return (
              <div
                key={property.id}
                onClick={() => handleSelectProperty(property)}
                className={`group flex cursor-pointer gap-3 rounded-xl border p-2.5 transition ${
                  isSelected
                    ? "border-orange-500 bg-orange-50/50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-20 w-24 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-orange-600">
                      {property.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="line-clamp-1">{property.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-600">
                      {property.price}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {property.rating}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map View Area */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Floating Selected Property Card Overlay */}
        {selectedProperty && (
          <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 transform px-4 w-full max-w-sm sm:max-w-md">
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex gap-4">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="h-24 w-28 rounded-xl object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                        {selectedProperty.type}
                      </span>
                      <button
                        onClick={() => setSelectedProperty(null)}
                        className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className="mt-1 font-bold text-gray-900">
                      {selectedProperty.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {selectedProperty.location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-orange-600">
                      {selectedProperty.price}
                    </span>
                    <Link
                      to={`/property-details/${selectedProperty.id}`}
                      className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700"
                    >
                      View Space
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
