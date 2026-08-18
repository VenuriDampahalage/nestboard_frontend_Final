import { useState } from "react"
import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Warehouse,
  Hotel,
  MapPin,
  DollarSign,
  Star,
  X,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Property, PropertyFilterParams } from "@/types/property"

interface Category {
  label: Property["type"] | "All"
  icon: LucideIcon | null
}

const categories: Category[] = [
  { label: "All", icon: null },
  { label: "House", icon: Home },
  { label: "Villa", icon: Warehouse },
  { label: "Apartment", icon: Building2 },
  { label: "Hotel", icon: Hotel },
]

interface SearchFiltersProps {
  filters: PropertyFilterParams
  onFilterChange: (updates: Partial<PropertyFilterParams>) => void
  onResetFilters: () => void
}

export function SearchFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeFiltersCount = [
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
  ].filter((val) => val !== undefined && val !== "").length

  return (
    <div className="relative z-20 -mt-7 px-4 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl border border-gray-100">
        {/* Primary Search & Filter Bar */}
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={filters.search || ""}
              placeholder="Search by property title, keyword..."
              className="h-11 rounded-xl border-gray-200 pl-10 text-sm focus:border-orange-500"
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={filters.city || ""}
              placeholder="Filter by city (e.g. Colombo, Kandy)..."
              className="h-11 rounded-xl border-gray-200 pl-10 text-sm focus:border-orange-500"
              onChange={(e) => onFilterChange({ city: e.target.value })}
            />
          </div>

          <Button
            variant={showAdvanced || activeFiltersCount > 0 ? "default" : "outline"}
            className="h-11 gap-2 rounded-xl border-gray-200 font-medium transition"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {(filters.search || filters.type !== "All" || activeFiltersCount > 0) && (
            <Button
              variant="ghost"
              className="h-11 gap-1.5 rounded-xl text-gray-500 hover:text-gray-900"
              onClick={onResetFilters}
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              size="sm"
              variant={
                (filters.type || "All") === label ? "default" : "outline"
              }
              className={`gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
                (filters.type || "All") === label
                  ? "bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() =>
                onFilterChange({ type: label === "All" ? "All" : label })
              }
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </Button>
          ))}
        </div>

        {/* Advanced Filter Options Drawer */}
        {showAdvanced && (
          <div className="mt-5 border-t border-gray-100 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-orange-500" /> Price Range (Monthly)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min ($)"
                  value={filters.minPrice ?? ""}
                  className="h-9 rounded-lg border-gray-200 text-xs"
                  onChange={(e) =>
                    onFilterChange({
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <span className="text-gray-400 text-xs">-</span>
                <Input
                  type="number"
                  placeholder="Max ($)"
                  value={filters.maxPrice ?? ""}
                  className="h-9 rounded-lg border-gray-200 text-xs"
                  onChange={(e) =>
                    onFilterChange({
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
              </label>
              <select
                value={filters.minRating ?? ""}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-orange-500 focus:outline-none"
                onChange={(e) =>
                  onFilterChange({
                    minRating: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

