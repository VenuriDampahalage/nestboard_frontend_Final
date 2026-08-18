import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchProperties } from "@/api/properties"
import type { PropertyFilterParams } from "@/types/property"

export function useInfiniteProperties(
  filters: Omit<PropertyFilterParams, "page"> = {},
  limit = 6
) {
  return useInfiniteQuery({
    queryKey: ["infinite-properties", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      fetchProperties({
        ...filters,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages, hasMore } = lastPage.pagination
      if (hasMore !== undefined) {
        return hasMore ? page + 1 : undefined
      }
      return page < totalPages ? page + 1 : undefined
    },
  })
}
