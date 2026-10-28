// TWEAK 1 — sign-up: a failed backend call (duplicate email, weak password)
// has to leave the form populated so the user can fix it.
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import {
  LuEye, LuEyeOff, LuMail, LuPhone, LuUser, LuLock, LuArrowRight, LuShip,
} from "react-icons/lu"
import { UseUser } from "../context/UserContext"

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function Sign_Up() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { addUser: register } = UseUser()
  const navigate = useNavigate()

  // on submit: any backend failure is a *message*, never a redirect. The
  // entered values stay in the fields and the global toast carries the reason.
  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Please fill up the form fully to sign up in FASCO")
      return
    }

    setSubmitting(true)
    try {
      await register(name, email, password, phone)
      navigate("/confirmation", { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4">
      <motion.div {...pageTransition} className="w-full max-w-[420px] rounded-[20px] border border-[#e6e6e6] bg-white p-8 shadow-[0_20px_56px rgba(0,0,0,0.07)] dark:border-[#262626] dark:bg-[#161616] dark:text-white">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#fca120] text-black">
            <LuShip size={18} />
          </div>
          <span className="font-Display text-[22px] tracking-[0.14em] text-black dark:text-white">
            FASCO<span className="text-[#fca120]">.</span>
          </span>
        </div>

        <h1 className="font-Display text-[28px] leading-[1.1] text-black dark:text-white">
          Create account
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a8a] dark:text-[#a5a5a5]">
          Fill in the details below and we will send you a confirmation code
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#5a5a5a] dark:text-[#a5a5a5]">
              Name
            </span>
            <div className="relative">
              <LuUser size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaa]" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="inputCls w-full !pl-9"
                disabled={submitting}
              />
            </div>
          </label>

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

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#5a5a5a] dark:text-[#a5a5a5]">
              Password
            </span>
            <div className="relative">
              <LuLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaa]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
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

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#5a5a5a] dark:text-[#a5a5a5]">
              Phone (optional)
            </span>
            <div className="relative">
              <LuPhone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaa]" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="+1 234 567 890"
                className="inputCls w-full !pl-9"
                disabled={submitting}
              />
            </div>
          </label>

          <button
            type="submit"
            className="btnDark w-full mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending…
              </>
            ) : (
              <>
                Sign up <LuArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[#8a8a8a] dark:text-[#a5a5a5]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#fca120] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
