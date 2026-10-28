import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation, Outlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product_Description from "./pages/Product_Description";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Thankyou from "./pages/Thankyou";
import Log_In from "./pages/Log_In";
import Sign_Up from "./pages/Sign_Up";
import ForgetPassword from "./pages/ForgetPassword";
import Confirmation from "./pages/Confirmation";
import EnterNewPassword from "./pages/EnterNewPassword";
import NotFound from "./pages/NotFound";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./components/ThemeProvider";
import { UseUser } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MiniCart from "./components/MiniCart";
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Coupons from "./pages/admin/Coupons";
import Users from "./pages/admin/Users";
import Subscribers from "./pages/admin/Subscribers";

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const PageShell = ({ children }) => {
  return <motion.div {...pageTransition}>{children}</motion.div>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = ({ canBrowse, currentUser }) => {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={canBrowse ? <PageShell><Home /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="/shop" element={canBrowse ? <PageShell><Shop /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="/product/:id" element={canBrowse ? <PageShell><Product_Description /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="/thankyou" element={canBrowse ? <PageShell><Thankyou /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<PageShell><Log_In /></PageShell>} />
          <Route path="/sign_up" element={<PageShell><Sign_Up /></PageShell>} />
          <Route path="/forget-password" element={<PageShell><ForgetPassword /></PageShell>} />
          <Route path="/confirmation" element={<PageShell><Confirmation /></PageShell>} />
          <Route path="/enter-new-password/:token" element={<PageShell><EnterNewPassword /></PageShell>} />
          {/* cart & checkout stay public — the design ships guest checkout
              (the "Have an account? Create Account" line on the checkout frame) */}
          <Route path="/cart" element={<PageShell><Cart /></PageShell>} />
          <Route path="/checkout" element={<PageShell><Checkout /></PageShell>} />
          {/* admin area — every screen requires a signed-in admin */}
          <Route
            path="/admin"
            element={
              currentUser?.role === "admin" && !currentUser.loading ? (
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              ) : canBrowse ? (
                <Navigate to="/login" replace />
              ) : (
                <PageShell>
                  <div className="flex items-center justify-center py-20">
                    <p className="text-[15px] text-[#8a8a8a]">
                      Loading dashboard…
                    </p>
                  </div>
                </PageShell>
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
      </AnimatePresence>
    </>
  );
};

const App = () => {
  const { currentUser, loading } = UseUser()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212] text-black dark:text-white font-Poppins">
        Loading...
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
