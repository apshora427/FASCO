// TWEAK 1 — login form: if the backend refuses the credentials (bad email/
// password), stop the form from resetting itself and pointing back at /.
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { LuEye, LuEyeOff, LuMail, LuLock, LuArrowRight, LuLogIn } from "react-icons/lu"
import { UseUser } from "../context/UserContext"

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function Log_In() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { LogInUser } = UseUser()
  const navigate = useNavigate()

  // on submit: NO router.push() and NO form.reset() — a backend error just
  // returns { success: false } and we toast it, keeping the entered values
  // so the user can retry.
  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter your email and password")
      return
    }

    setSubmitting(true)
    try {
      const user = await LogInUser(email, password)
      if (user) navigate("/admin", { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4">
      <motion.div {...pageTransition} className="w-full max-w-[420px] rounded-[20px] border border-[#e6e6e6] bg-white p-8 shadow-[0_20px_56px rgba(0,0,0,0.07)] dark:border-[#262626] dark:bg-[#161616] dark:text-white">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#fca120] text-black">
            <LuLogIn size={18} />
          </div>
          <span className="font-Display text-[22px] tracking-[0.14em] text-black dark:text-white">
            FASCO<span className="text-[#fca120]">.</span>
          </span>
        </div>

        <h1 className="font-Display text-[28px] leading-[1.1] text-black dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a8a] dark:text-[#a5a5a5]">
          Sign in to your account to continue shopping
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#5a5a5a] dark:text-[#a5a5a5]">
              Email
            </span>
            <div className="relative">
              <LuMail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaa]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="inputCls w-full !pl-9"
                disabled={submitting}
              />
            </div>
          </label>

          <label>
            <span className="mb-1.5 block text-[13px] font-medium text-[#5a5a5a] dark:text-[#a5a5a5]">
              Password
            </span>
            <div className="relative">
              <LuLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaa]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="inputCls w-full !pl-9"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded hover:text-[#484848] dark:hover:text-[#fca120]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LuEyeOff size={15} /> : <LuEye size={15} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-[#5a5a5a] transition-colors hover:text-black dark:text-[#a5a5a5] dark:hover:text-white">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#d4d4d4] rounded text-[#fca120] focus:ring-2 focus:ring-black/20 dark:border-[#333] dark:rounded" />
              Remember me
            </label>
            <a href="/forget-password" className="text-[13px] font-medium text-[#fca120] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btnDark w-full mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in…
              </>
            ) : (
              <>
                Sign in <LuArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[#8a8a8a] dark:text-[#a5a5a5]">
          New to FASCO?{" "}
          <Link to="/sign_up" className="font-medium text-[#fca120] hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
