import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ClerkProvider } from "@clerk/react"

const queryClient = new QueryClient()
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  createRoot(document.getElementById("root")!).render(
    <div style={{ padding: "3rem 1.5rem", fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "40px auto", textAlign: "center", border: "1px solid #fca5a5", borderRadius: "12px", backgroundColor: "#fef2f2" }}>
      <h2 style={{ color: "#991b1b", marginBottom: "1rem", fontSize: "1.5rem" }}>Configuration Required</h2>
      <p style={{ color: "#7f1d1d", fontSize: "1rem", marginBottom: "1rem" }}>
        <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> is missing in your environment setup.
      </p>
      <div style={{ textAlign: "left", backgroundColor: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid #fee2e2", fontSize: "0.875rem", color: "#374151" }}>
        <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600" }}>To fix this:</p>
        <ol style={{ margin: "0", paddingLeft: "1.25rem" }}>
          <li>Create a <code>.env.local</code> file in your project root folder.</li>
          <li>Add: <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code></li>
          <li>Restart your dev server (<code>npm run dev</code>).</li>
        </ol>
      </div>
    </div>
  )
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ClerkProvider publishableKey={clerkPubKey}>
            <App />
          </ClerkProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}