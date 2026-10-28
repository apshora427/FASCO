
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { LuArrowLeft, LuArrowRight } from "react-icons/lu"

import AuthLayout from "../components/AuthLayout"
import { forgotPassword } from "../api/backend"

import forgetImage from "../assets/reference/auth/forget.jpg"

export default function ForgetPassword() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || "")
  const [busy, setBusy] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    const cleanEmail = email.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }

    setBusy(true)

    try {
      const result = await forgotPassword(cleanEmail)

      if (!result?.success) {
        toast.error(
          result?.message || "Could not send the confirmation code."
        )
        return
      }

      toast.success(
        result.message || "Check your email for the confirmation code."
      )

      if (result.devCode) {
        toast.info(`Development confirmation code: ${result.devCode}`)
      }

      navigate("/confirmation", {
        state: {
          flow: "reset",
          email: cleanEmail,
        },
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout variant="forget" image={forgetImage}>
      <div className="sign__content sign-content _forget">
        <h1 className="sign-content__title">
          Forgot Password?
        </h1>

        <p className="mt-3 text-center text-sm leading-relaxed text-[#777]">
          No worries! Enter the email address associated with
          your account, and we'll send you a confirmation code
          to reset your password.
        </p>
      </div>

      <div className="sign__forget forget">
        <form
          className="forget__form form-forget"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-forget__input-block">
            <div className="form-forget__item">
              <input
                className="form-forget__input"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
                required
              />
            </div>
          </div>

          <div className="form-forget__item _button">
            <button
              type="submit"
              disabled={busy}
              className="form-forget__button button sign-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                "Sending Code..."
              ) : (
                <>
                  Send Confirmation Code
                  <LuArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="form-forget__item">
            <div className="form-forget__link">
              <Link
                to="/login"
                className="inline-flex items-center gap-2"
              >
                <LuArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
