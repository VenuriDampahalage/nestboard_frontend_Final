import { useEffect, useRef } from "react"
import { PropertyCard } from "@/components/common/PropertyCard"
import type { Property, SortByOption, SortOrderOption } from "@/types/property"
import { ArrowUpDown, Loader2, SearchX } from "lucide-react"

interface PropertyListProps {
  properties: Property[]
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  fetchNextPage: () => void
  sortBy?: SortByOption
  sortOrder?: SortOrderOption
  onSortChange: (sortBy: SortByOption, sortOrder: SortOrderOption) => void
  onResetFilters: () => void
}

export function PropertyList({
  properties,
  totalCount,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  sortBy = "recency",
  sortOrder = "desc",
  onSortChange,
  onResetFilters,
}: PropertyListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const currentSortKey = `${sortBy}-${sortOrder}`

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "price-asc") onSortChange("price", "asc")
    else if (value === "price-desc") onSortChange("price", "desc")
    else if (value === "rating-desc") onSortChange("rating", "desc")
    else if (value === "recency-desc") onSortChange("recency", "desc")
  }

  return (
    <section className="mt-8 px-4 md:px-8 pb-16 max-w-7xl mx-auto">
      {/* Header with Server Total Count & Server-Side Sorting */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Property Discovery
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Counting matching properties...
              </span>
            ) : (
              <span>
                <strong className="font-semibold text-gray-900">{totalCount}</strong>{" "}
                {totalCount === 1 ? "property" : "properties"} found
                {properties.length < totalCount && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({properties.length} loaded)
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Server Sort Selector */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 self-start sm:self-auto">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600">Sort by:</span>
          <select
            value={currentSortKey}
            onChange={handleSortSelect}
            className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="recency-desc">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: Highest First</option>
          </select>
        </div>
      </div>

      {/* Initial Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gray-100 animate-pulse border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && properties.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <div className="rounded-full bg-orange-50 p-4 text-orange-600 mb-4">
            <SearchX className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            We couldn't find any properties matching your current search parameters.
            Try resetting your filters or clearing search terms.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-700"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Property Cards Grid */}
      {!isLoading && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Loading Indicator */}
      <div ref={sentinelRef} className="mt-10 flex items-center justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-600 shadow-sm border border-orange-100 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more properties...
          </div>
        )}
        {!hasNextPage && !isLoading && properties.length > 0 && (
          <p className="text-xs font-semibold text-gray-400">
            You've reached the end of the property catalog.
          </p>
        )}
      </div>
    </section>
  )
}

