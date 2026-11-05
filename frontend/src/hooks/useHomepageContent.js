import { useContext } from "react"
import { HomepageContentContext } from "./HomepageContentContext"

export const useHomepageContent = () => {
  const context = useContext(HomepageContentContext)
  if (!context) throw new Error("useHomepageContent must be used within HomepageContentProvider")
  return context
}
