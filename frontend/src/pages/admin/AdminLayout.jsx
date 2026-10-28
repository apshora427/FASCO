import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import {
  LuLayoutDashboard,
  LuPackage,
  LuTags,
  LuShoppingBag,
  LuTicket,
  LuUsers,
  LuMail,
  LuStore,
  LuLogOut,
  LuMenu,
  LuX,
} from "react-icons/lu"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { UseUser } from "../../context/UserContext"

const NAV = [
  { to: "/admin", end: true, label: "Overview", icon: LuLayoutDashboard },
  { to: "/admin/products", label: "Products", icon: LuPackage },
  { to: "/admin/categories", label: "Categories", icon: LuTags },
  { to: "/admin/orders", label: "Orders", icon: LuShoppingBag },
  { to: "/admin/coupons", label: "Coupons", icon: LuTicket },
  { to: "/admin/users", label: "Users", icon: LuUsers },
  { to: "/admin/subscribers", label: "Subscribers", icon: LuMail },
]

const Rail = ({ onNavigate }) => {
  const { currentUser, logOut } = UseUser()
  const navigate = useNavigate()

  const logout = async () => {
    await logOut()
    toast.info("Signed out of the dashboard")
    navigate("/login")
  }

  return (
    <div className="flex h-full flex-col bg-[#0b0b0b] text-white">
      <div className="flex items-center justify-between px-6 py-6">
        <NavLink to="/" className="font-Display text-[26px] tracking-[0.14em] text-white">
          FASCO<span className="text-[#fca120]">.</span>
        </NavLink>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-[#9a9a9a] hover:bg-white/10 hover:text-white lg:hidden">
          <LuX size={18} />
        </button>
      </div>

      <p className="px-6 pb-2 text-[11px] font-semibold tracking-[0.2em] text-[#5f5f5f] uppercase">
        Management
      </p>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative mb-1 flex items-center gap-3 rounded-[10px] px-3 py-3 text-[14px] transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-[#8f8f8f] hover:bg-white/5 hover:text-white"
              }`
            }>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="rail-marker"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[#fca120]"
                  />
                )}
                <Icon size={18} className={isActive ? "text-[#fca120]" : ""} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-[10px] bg-white/5 p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fca120] text-[15px] font-bold text-black">
            {(currentUser?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{currentUser?.name}</p>
            <p className="truncate text-[11px] text-[#8f8f8f]">{currentUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8f8f8f] transition-colors hover:bg-white/10 hover:text-[#fca120]">
            <LuLogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminLayout = () => {
  const { currentUser } = UseUser()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") navigate("/", { replace: true })
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-[#1a1a1a] dark:bg-[#0d0d0d] dark:text-[#e8e8e8]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:block">
        <Rail />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[272px]">
            <Rail onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-[#e9e9e9] bg-white/85 px-4 backdrop-blur-md dark:border-[#1f1f1f] dark:bg-[#111111]/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e4e4e4] text-[#484848] lg:hidden dark:border-[#2c2c2c] dark:text-[#ccc]">
              <LuMenu size={18} />
            </button>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9a9a9a] uppercase">
                Admin Dashboard
              </p>
              <p className="text-[15px] font-medium text-black dark:text-white">
                Run your whole store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden items-center gap-2 rounded-[8px] border border-[#e4e4e4] px-3.5 py-2 text-[13px] text-[#484848] transition-colors hover:border-black hover:text-black sm:inline-flex dark:border-[#2c2c2c] dark:text-[#ccc] dark:hover:border-[#fca120] dark:hover:text-[#fca120]">
              <LuStore size={15} /> View store
            </a>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-black text-[13px] font-bold text-white dark:bg-[#fca120] dark:text-black">
              {(currentUser?.name || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
