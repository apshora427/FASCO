import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate, Outlet } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./components/ThemeProvider";
import { UseUser } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MiniCart from "./components/MiniCart";
import SectionMotion from "./animation/SectionMotion";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Product_Description = lazy(() => import("./pages/Product_Description"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Thankyou = lazy(() => import("./pages/Thankyou"));
const Log_In = lazy(() => import("./pages/Log_In"));
const Sign_Up = lazy(() => import("./pages/Sign_Up"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const EnterNewPassword = lazy(() => import("./pages/EnterNewPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Overview = lazy(() => import("./pages/admin/Overview"));
const Products = lazy(() => import("./pages/admin/Products"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Users = lazy(() => import("./pages/admin/Users"));
const Subscribers = lazy(() => import("./pages/admin/Subscribers"));
const Account = lazy(() => import("./pages/Account"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Compare = lazy(() => import("./pages/Compare"));

const PageShell = ({ children }) => {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -5 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: "easeOut" }}>
      <SectionMotion />
      {children}
    </motion.div>
  )
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageLoading = () => (
  <div className="flex min-h-[45vh] items-center justify-center" role="status" aria-label="Loading page">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-black dark:border-[#333] dark:border-t-[#fca120]" />
  </div>
)

const AppRoutes = ({ canBrowse, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const requireAuthentication = (event) => {
      const from = event.detail?.from
      navigate("/login", {
        state: { from: typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/" },
      })
    }
    window.addEventListener("fasco:auth:required", requireAuthentication)
    return () => window.removeEventListener("fasco:auth:required", requireAuthentication)
  }, [navigate])

  const adminDestination = {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoading />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={canBrowse ? <PageShell><Home /></PageShell> : <Navigate to="/login" replace />} />
            <Route path="/shop" element={canBrowse ? <PageShell><Shop /></PageShell> : <Navigate to="/login" replace />} />
            <Route path="/product/:id" element={canBrowse ? <PageShell><Product_Description /></PageShell> : <Navigate to="/login" replace />} />
            <Route path="/thankyou" element={canBrowse ? <PageShell><Thankyou /></PageShell> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<PageShell><Log_In /></PageShell>} />
            <Route path="/sign_up" element={<PageShell><Sign_Up /></PageShell>} />
            <Route path="/forget-password" element={<PageShell><ForgetPassword /></PageShell>} />
            <Route path="/confirmation" element={<PageShell><Confirmation /></PageShell>} />
            <Route path="/enter-new-password" element={<PageShell><EnterNewPassword /></PageShell>} />
            <Route
              path="/account"
              element={
                currentUser?.role === "user" ? (
                  <PageShell><Account /></PageShell>
                ) : currentUser?.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace state={{ from: adminDestination }} />
                )
              }
            />
            <Route
              path="/wishlist"
              element={
                currentUser?.role === "user" ? (
                  <PageShell><Wishlist /></PageShell>
                ) : currentUser?.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace state={{ from: { pathname: "/wishlist" } }} />
                )
              }
            />
            <Route path="/compare" element={canBrowse ? <PageShell><Compare /></PageShell> : <Navigate to="/login" replace />} />
            <Route path="/cart" element={<PageShell><Cart /></PageShell>} />
            <Route path="/checkout" element={<PageShell><Checkout /></PageShell>} />
            <Route
              path="/admin"
              element={
                currentUser?.role === "admin" ? (
                  <AdminLayout><Outlet /></AdminLayout>
                ) : currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace state={{ from: adminDestination }} />
                )
              }>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="users" element={<Users />} />
              <Route path="subscribers" element={<Subscribers />} />
            </Route>
            <Route path="*" element={canBrowse ? <PageShell><NotFound /></PageShell> : <Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  const { currentUser, loading } = UseUser()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#121212]" role="status" aria-label="Restoring session">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-black dark:border-[#333] dark:border-t-[#fca120]" />
      </div>
    )
  }

  // Allow browsing without auth for now
  const canBrowse = true

  return (
    <BrowserRouter>
      <ThemeToggle />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme={theme} />
      <MiniCart />
      <AppRoutes canBrowse={canBrowse} currentUser={currentUser} />
    </BrowserRouter>
  );
};
export default App;
