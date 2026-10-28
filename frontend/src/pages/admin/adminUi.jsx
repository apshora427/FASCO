import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

// shared admin panel card — used by subscribers list and any future one" + "


export const Card = ({ children, className }) => (
  <div className={"rounded-[14px] border border-[#ececec] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.05)] dark:border-[#262626] dark:bg-[#161616] dark:shadow-none " + (className || "")}>
    {children}
  </div>
)

/* Shared building blocks for the admin dashboard — keeps every screen's
 * look (cards, badges, modal, empty state) identical without duplicating it. */

export const card =
  "rounded-[14px] border border-[#ececec] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.05)] dark:border-[#262626] dark:bg-[#161616] dark:shadow-none"

export const inputCls =
  "w-full rounded-[8px] border border-[#e2e2e2] bg-white px-4 py-2.5 text-[14px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-black dark:border-[#333] dark:bg-[#101010] dark:text-white dark:placeholder:text-[#5f5f5f] dark:focus:border-[#fca120]"

export const btnDark =
  "inline-flex items-center justify-center gap-2 rounded-[8px] bg-black px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#fca120] dark:text-black dark:hover:bg-[#ffb84d]"

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#e2e2e2] bg-white px-4 py-2.5 text-[13px] font-medium text-[#484848] transition-colors hover:border-black hover:text-black dark:border-[#333] dark:bg-transparent dark:text-[#c9c9c9] dark:hover:border-[#fca120] dark:hover:text-[#fca120]"

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  shipped: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  admin: "bg-[#fca120]/20 text-[#a56400] dark:text-[#fca120]",
  user: "bg-[#efefef] text-[#5a5a5a] dark:bg-[#242424] dark:text-[#aaa]",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  inactive: "bg-[#efefef] text-[#5a5a5a] dark:bg-[#242424] dark:text-[#aaa]",
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  unverified: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  low: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
}

export const Badge = ({ kind = "user", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
      STATUS_STYLES[kind] || STATUS_STYLES.user
    }`}>
    {children || kind}
  </span>
)

export const SectionTitle = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-Display text-[clamp(26px,2.4vw,36px)] leading-none text-black dark:text-white">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-[14px] text-[#8a8a8a]">{subtitle}</p>}
    </div>
    {action}
  </div>
)

export const EmptyState = ({ title = "Nothing here yet", hint }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
    <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f4f4f4] text-[22px] dark:bg-[#202020]">
      ✦
    </div>
    <p className="text-[15px] font-medium text-[#484848] dark:text-[#d4d4d4]">{title}</p>
    {hint && <p className="max-w-sm text-[13px] text-[#9a9a9a]">{hint}</p>}
  </div>
)

export const Spinner = ({ label = "Loading…" }) => (
  <div className="flex items-center justify-center gap-3 py-20 text-[14px] text-[#8a8a8a]">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-black dark:border-[#333] dark:border-t-[#fca120]" />
    {label}
  </div>
)

// Centered modal used for confirms and detail views.
export const Modal = ({ open, onClose, title, children, width = "max-w-lg" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.()
    if (open) {
      window.addEventListener("keydown", onKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}>
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative z-10 w-full ${width} max-h-[90vh] overflow-y-auto rounded-[16px] bg-white p-6 shadow-2xl dark:bg-[#161616]`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-Display text-[22px] text-black dark:text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-[#8a8a8a] transition-colors hover:bg-[#f2f2f2] hover:text-black dark:hover:bg-[#242424] dark:hover:text-white">
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, busy }) => (
  <Modal open={open} onClose={onCancel} title={title || "Are you sure?"} width="max-w-md">
    <p className="text-[14px] leading-relaxed text-[#6a6a6a] dark:text-[#a5a5a5]">{message}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" className={btnGhost} onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="inline-flex items-center rounded-[8px] bg-[#e11d48] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#be123c] disabled:opacity-50"
        onClick={onConfirm}
        disabled={busy}>
        {busy ? "Working…" : "Yes, delete"}
      </button>
    </div>
  </Modal>
)

// Slide-in panel used by the product editor and order detail.
export const Drawer = ({ open, onClose, title, children, width = "max-w-2xl" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.()
    if (open) {
      window.addEventListener("keydown", onKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={`absolute inset-y-0 right-0 z-10 w-full ${width} overflow-y-auto bg-white shadow-2xl dark:bg-[#141414]`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#ececec] bg-white/95 px-6 py-4 backdrop-blur dark:border-[#262626] dark:bg-[#141414]/95">
              <h2 className="font-Display text-[22px] text-black dark:text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-[#8a8a8a] transition-colors hover:bg-[#f2f2f2] hover:text-black dark:hover:bg-[#242424] dark:hover:text-white">
                ✕
              </button>
            </div>
            <div className="px-6 py-6">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}