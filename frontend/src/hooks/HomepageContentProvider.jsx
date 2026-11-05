import { useCallback, useEffect, useMemo, useState } from "react"
import { getHomepage } from "../api/backend"
import { HomepageContentContext } from "./HomepageContentContext"

export const HomepageContentProvider = ({ children }) => {
  const [homepage, setHomepage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    getHomepage()
      .then((response) => {
        if (!active) return
        if (
          !response ||
          !Array.isArray(response.products) ||
          !Array.isArray(response.deals) ||
          !response.content ||
          !response.content.site?.brandName ||
          !response.content.navigation?.home?.length ||
          !response.content.navigation?.footer?.length ||
          !Number.isFinite(Date.parse(response.dealEndsAt))
        ) {
          setError("Homepage content is temporarily unavailable.")
          return
        }
        setHomepage(response)
      })
      .catch(() => {
        if (active) setError("Homepage content is temporarily unavailable.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  useEffect(() => {
    const refresh = () => setReloadKey((key) => key + 1)
    window.addEventListener("fasco:catalog:updated", refresh)
    window.addEventListener("fasco:homepage:updated", refresh)
    return () => {
      window.removeEventListener("fasco:catalog:updated", refresh)
      window.removeEventListener("fasco:homepage:updated", refresh)
    }
  }, [])

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])
  const value = useMemo(
    () => ({ ...homepage, loading, error, retry }),
    [homepage, loading, error, retry]
  )

  return (
    <HomepageContentContext.Provider value={value}>
      {children}
    </HomepageContentContext.Provider>
  )
}
