import { useEffect, useState } from "react"
import { getRecommendations, trackRecommendationEvent } from "../api/backend"
import { resolveImage } from "../data/products"
import { UseUser } from "../context/UserContext"
import ProductCard from "./ProductCard"
import { useHomepageContent } from "../hooks/useHomepageContent.js"

const PersonalizedRecommendations = ({ excludeProductId }) => {
  const { currentUser } = UseUser()
  const { content } = useHomepageContent()
  const userId = currentUser?.id
  const userRole = currentUser?.role
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [signals, setSignals] = useState(null)

  useEffect(() => {
    let active = true
    if (!userId || userRole !== "user") {
      setRecommendations([])
      return () => { active = false }
    }

    const loadRecommendations = async () => {
      setLoading(true)
      if (excludeProductId) {
        const tracked = await trackRecommendationEvent(excludeProductId, "view")
        if (!tracked?.success) {
          console.warn("[recommendations] Product view activity could not be recorded")
        }
      }

      const response = await getRecommendations({ excludeProductId, limit: 8 })
      if (!active) return
      if (!response?.success || !Array.isArray(response.recommendations)) {
        console.warn("[recommendations] Personalized products could not be loaded")
        setRecommendations([])
        setSignals(null)
      } else {
        setRecommendations(response.recommendations.map((product) => ({
          ...product,
          image: resolveImage(product.image),
        })))
        setSignals(response.signals || null)
      }
      setLoading(false)
    }

    loadRecommendations()
    return () => { active = false }
  }, [userId, userRole, excludeProductId])

  if (!content || !currentUser || currentUser.role !== "user" || (!loading && recommendations.length === 0)) {
    return null
  }

  return (
    <section className="bg-white py-[clamp(36px,6vw,84px)]">
      <div className="container">
        <div className="mb-[clamp(24px,3vw,42px)] text-center">
          <h2 className="section-title">{content.recommendations.title}</h2>
          <p className="section-copy mx-auto mt-4 max-w-[614px]">
            {signals?.similarCustomers
              ? content.recommendations.similarCustomers
              : signals?.browsing || signals?.purchases
                ? content.recommendations.activity
                : content.recommendations.popular}
          </p>
        </div>
        {loading && recommendations.length === 0 ? (
          <p className="text-center text-[14px] text-[#8a8a8a]" role="status">{content.recommendations.loading}</p>
        ) : (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))]"
            style={{ columnGap: "clamp(15px, 4.25vw, 61px)", rowGap: "clamp(15px, 4.2vw, 60px)" }}>
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default PersonalizedRecommendations
