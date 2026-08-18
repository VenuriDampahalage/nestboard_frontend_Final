import { useQuery } from "@tanstack/react-query"
import { fetchProperties } from "@/api/properties"
import type { PropertyFilterParams } from "@/types/property"

export function useProperties(params: PropertyFilterParams = {}) {
  const query = useQuery({
    queryKey: ["properties", params],
    queryFn: () => fetchProperties(params),
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    pagination: query.data?.pagination,
  }
}

