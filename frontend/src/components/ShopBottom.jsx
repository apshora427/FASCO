import { useHomepageContent } from "../hooks/useHomepageContent.js"
import PromoBanner from "./PromoBanner"
import Features from "./Features"
import InstagramFeed from "./InstagramFeed"
import Newsletter from "./Newsletter"
import Footer from "./Footer"

const ShopBottomContent = () => {
  const { content, loading, error, retry } = useHomepageContent()

  if (loading) return <p className="container py-8 text-center text-[#8a8a8a]" role="status">Loading store content…</p>
  if (error) {
    return (
      <div className="container flex items-center justify-center gap-3 py-8" role="alert">
        <p className="text-[#8a8a8a]">{error}</p>
        <button type="button" className="underline underline-offset-2" onClick={retry}>Try again</button>
      </div>
    )
  }

  return (
    <>
      <PromoBanner />
      <Features />
      <InstagramFeed />
      <Newsletter />
      <Footer
        links={content.navigation.footer}
        brandName={content.site.brandName}
        copyright={content.site.copyright}
      />
    </>
  )
}

const ShopBottom = () => (
  <ShopBottomContent />
)

export default ShopBottom
