import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import BrandStrip from "../components/BrandStrip"
import DealsOfTheMonth from "../components/DealsOfTheMonth"
import NewArrival from "../components/NewArrival"
import PromoBanner from "../components/PromoBanner"
import Features from "../components/Features"
import InstagramFeed from "../components/InstagramFeed"
import Testimonials from "../components/Testimonials"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import ScrollFadeIn from "../animation/ScrollFadeIn"

const Home = () => (
  <main className="bg-white">
    <Navbar />
    <Hero />
    <BrandStrip />
    <ScrollFadeIn>
      <DealsOfTheMonth />
    </ScrollFadeIn>
    <ScrollFadeIn>
      <NewArrival />
    </ScrollFadeIn>
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
    <Footer />
  </main>
)

export default Home
