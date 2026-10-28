import { Link } from "react-router"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const NotFound = () => (
  <main className="flex min-h-screen flex-col bg-white">
    <Navbar variant="shop" />

    <div className="container flex flex-1 flex-col items-center justify-center py-[clamp(56px,8vw,120px)] text-center">
      <h1 className="font-Display text-[clamp(72px,10vw,150px)] leading-none font-bold text-black dark:text-white">
        404
      </h1>
      <p className="mt-6 text-[clamp(15px,1.2vw,18px)] leading-[1.6] text-[#8a8a8a]">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn-dark mt-[42px] px-[62px] tracking-[0.02em]">
        Back To Home
      </Link>
    </div>

    <Footer />
  </main>
)

export default NotFound
