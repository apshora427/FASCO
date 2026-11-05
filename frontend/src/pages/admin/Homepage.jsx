import { useCallback, useEffect, useState } from "react"
import { LuRefreshCw, LuSave } from "react-icons/lu"
import { getHomepage, updateHomepage } from "../../api/backend"
import { btnDark, btnGhost, card, SectionTitle, Spinner } from "./adminUi"

export default function Homepage() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadContent = useCallback(async () => {
    setLoading(true)
    setError("")
    setMessage("")
    const response = await getHomepage()
    if (!response?.success || !response.content) {
      setError("Homepage content could not be loaded from the backend.")
    } else {
      setContent(JSON.stringify(response.content, null, 2))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const saveContent = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const parsed = JSON.parse(content)
      const response = await updateHomepage(parsed)
      if (!response?.success) {
        setError(response?.message || "Homepage content could not be saved.")
        return
      }
      setContent(JSON.stringify(response.content, null, 2))
      window.dispatchEvent(new Event("fasco:homepage:updated"))
      setMessage("Homepage content saved to MongoDB.")
    } catch (saveError) {
      setError(
        saveError instanceof SyntaxError
          ? "The content must be valid JSON."
          : saveError.message || "Homepage content could not be saved."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <SectionTitle
        title="Homepage Content"
        subtitle="Edit the backend-managed homepage copy, imagery, links, brands, testimonials, and campaign layout."
        action={
          <button type="button" className={btnGhost} onClick={loadContent} disabled={loading || busy}>
            <LuRefreshCw size={15} /> Reload
          </button>
        }
      />
      {loading ? (
        <Spinner label="Loading homepage content…" />
      ) : (
        <form onSubmit={saveContent} className={`${card} p-5 sm:p-7`}>
          <p className="mb-4 text-[13px] leading-relaxed text-[#777] dark:text-[#aaa]">
            Product names, prices, stock, deals, and arrivals come from the Products catalogue.
            This editor changes the homepage presentation data. Use existing image keys (for
            example, <code>hero-left</code> or <code>promo-base</code>), an HTTPS image URL, or an
            uploaded <code>/uploads/…</code> path.
          </p>
          <label htmlFor="homepage-content" className="sr-only">Homepage JSON content</label>
          <textarea
            id="homepage-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            spellCheck={false}
            className="min-h-[65vh] w-full rounded-[8px] border border-[#e2e2e2] bg-[#fbfbfb] p-4 font-mono text-[12px] leading-relaxed text-[#1a1a1a] outline-none focus:border-black dark:border-[#333] dark:bg-[#101010] dark:text-white dark:focus:border-[#fca120]"
          />
          {error && <p className="mt-3 text-[13px] text-rose-600" role="alert">{error}</p>}
          {message && <p className="mt-3 text-[13px] text-emerald-700" role="status">{message}</p>}
          <div className="mt-5 flex justify-end">
            <button type="submit" className={btnDark} disabled={busy}>
              <LuSave size={15} /> {busy ? "Saving…" : "Save homepage content"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
