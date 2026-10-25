import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router";
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
import { UseUser } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
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
          <Route path="/login" element={!currentUser ? <PageShell><Log_In /></PageShell> : <Navigate to="/" replace />} />
          <Route path="/sign_up" element={!currentUser ? <PageShell><Sign_Up /></PageShell> : <Navigate to="/" replace />} />
          <Route path="/forget-password" element={!currentUser ? <PageShell><ForgetPassword /></PageShell> : <Navigate to="/" replace />} />
          <Route path="/confirmation" element={!currentUser ? <PageShell><Confirmation /></PageShell> : <Navigate to="/" replace />} />
          <Route path="/enter-new-password/:token" element={!currentUser ? <PageShell><EnterNewPassword /></PageShell> : <Navigate to="/" replace />} />
          <Route path="/cart" element={currentUser ? <PageShell><Cart /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="/checkout" element={currentUser ? <PageShell><Checkout /></PageShell> : <Navigate to="/login" replace />} />
          <Route path="*" element={canBrowse ? <PageShell><NotFound /></PageShell> : <Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  const { currentUser, loading } = UseUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212] text-black dark:text-white font-Poppins">
        Loading...
      </div>
    )
  }

  // TODO: re-enable the auth gate (Boolean(currentUser || isGuest)) once the
  // login/sign-up pages are built — until then everyone should see the site.
  const canBrowse = true

  return (
    <BrowserRouter>
      <ThemeToggle />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      <AppRoutes canBrowse={canBrowse} currentUser={currentUser} />
    </BrowserRouter>
  );
};
export default App;
