import { useHomepageContent } from "../hooks/useHomepageContent.js"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import BrandStrip from "../components/BrandStrip"
import DealsOfTheMonth from "../components/DealsOfTheMonth"
import NewArrival from "../components/NewArrival"
import PersonalizedRecommendations from "../components/PersonalizedRecommendations"
import PromoBanner from "../components/PromoBanner"
import Features from "../components/Features"
import InstagramFeed from "../components/InstagramFeed"
import Testimonials from "../components/Testimonials"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import ScrollFadeIn from "../animation/ScrollFadeIn"

const HomePage = () => {
  const { content, loading, error, retry } = useHomepageContent()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white" role="status">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-black" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-center">
        <p role="alert" className="text-[16px] text-[#767676]">{error}</p>
        <button type="button" onClick={retry} className="btn-dark">Try again</button>
      </main>
    )
  }

  return (
    <main className="bg-white">
      <Navbar homeLinks={content.navigation.home} brandName={content.site.brandName} />
      <Hero />
      <BrandStrip />
      <ScrollFadeIn>
        <DealsOfTheMonth />
      </ScrollFadeIn>
      <ScrollFadeIn>
        <NewArrival />
      </ScrollFadeIn>
      <PersonalizedRecommendations />
      <ScrollFadeIn>
        <PromoBanner />
        <Features />
      </ScrollFadeIn>
      <ScrollFadeIn>
        <InstagramFeed />
      </ScrollFadeIn>
      <ScrollFadeIn>
        <Testimonials />
      </ScrollFadeIn>
      <ScrollFadeIn>
        <Newsletter />
      </ScrollFadeIn>
      <Footer
        links={content.navigation.footer}
        brandName={content.site.brandName}
        copyright={content.site.copyright}
      />
    </main>
  )
}

const Home = () => <HomePage />

export default Home
