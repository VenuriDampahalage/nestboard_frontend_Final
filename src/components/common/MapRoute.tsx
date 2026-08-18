import { lazy, Suspense } from "react"

const MapPage = lazy(() => import("@/pages/map/MapPage"))

export function MapRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-gray-500">
          Loading map module…
        </div>
      }
    >
      <MapPage />
    </Suspense>
  )
}

