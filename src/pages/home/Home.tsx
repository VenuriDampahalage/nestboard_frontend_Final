import { useMemo } from "react"
import { useSearchParams } from "react-router"
import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import { useInfiniteProperties } from "@/hooks/useInfiniteProperties"
import type { Property, PropertyFilterParams, SortByOption, SortOrderOption } from "@/types/property"

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Extract filter parameters directly from URL search params
  const filters: PropertyFilterParams = useMemo(() => {
    const search = searchParams.get("search") || undefined
    const type = (searchParams.get("type") as Property["type"] | "All") || "All"
    const city = searchParams.get("city") || undefined
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")
    const minRatingParam = searchParams.get("minRating")
    const sortBy = (searchParams.get("sortBy") as SortByOption) || "recency"
    const sortOrder = (searchParams.get("sortOrder") as SortOrderOption) || "desc"

    return {
      search,
      type,
      city,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      minRating: minRatingParam ? Number(minRatingParam) : undefined,
      sortBy,
      sortOrder,
    }
  }, [searchParams])

  // Call Infinite Query with current URL filters
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProperties(filters)

  // Update URL search parameters whenever filters change
  const handleFilterChange = (updates: Partial<PropertyFilterParams>) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "All") {
        nextParams.delete(key)
      } else {
        nextParams.set(key, String(value))
      }
    })

    setSearchParams(nextParams, { replace: true })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handleSortChange = (sortBy: SortByOption, sortOrder: SortOrderOption) => {
    handleFilterChange({ sortBy, sortOrder })
  }

  // Deduplicate results across paginated pages by property.id
  const properties = useMemo(() => {
    if (!data?.pages) return []
    const all = data.pages.flatMap((page) => page.data)
    const map = new Map<string, Property>()
    all.forEach((item) => map.set(item.id, item))
    return Array.from(map.values())
  }, [data])

  const totalCount = data?.pages[0]?.pagination.total ?? properties.length

  return (
    <>
      <HeroSection />
      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {isError && (
        <div className="mx-auto max-w-7xl px-8 py-10 text-red-500 font-semibold text-center">
          Failed to load properties from server. Please check your network connection.
        </div>
      )}

      <PropertyList
        properties={properties}
        totalCount={totalCount}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
      />
    </>
  )
}

