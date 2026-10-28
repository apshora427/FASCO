export const COMPARE_STORAGE_KEY = "fasco_compare"

export const readComparedIds = () => {
  const saved = localStorage.getItem(COMPARE_STORAGE_KEY)
  if (!saved) return []
  const ids = JSON.parse(saved)
  if (!Array.isArray(ids)) throw new Error("Saved comparison list is invalid.")
  return [...new Set(ids.map(String))]
}

export const saveComparedIds = (ids) =>
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids))
