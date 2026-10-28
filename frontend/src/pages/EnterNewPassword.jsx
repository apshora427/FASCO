
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import {
  LuArrowLeft,
  LuArrowRight,
  LuEye,
  LuEyeOff,
  LuLockKeyhole,
} from "react-icons/lu"

import AuthLayout from "../components/AuthLayout"
import { setNewPassword } from "../api/backend"

import confirmationImage from "../assets/reference/auth/confirmation.jpg"

export default function EnterNewPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, code } = location.state || {}

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email || !code) {
      toast.error("Your reset session is missing. Please request a new code.")
      return
    }

    if (password.length < 8) {
      toast.error("Your password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setBusy(true)

    try {
      const result = await setNewPassword(
        email,
        code,
        password,
        confirmPassword
      )

      if (!result?.success) {
        toast.error(
          result?.message || "Could not reset your password."
        )
        return
      }

      toast.success(
        result.message || "Your password has been changed successfully."
      )

      navigate("/login", {
        replace: true,
        state: { email: location.state?.email || "" },
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      variant="confirmation"
      image={confirmationImage}
    >
      <div className="sign__content sign-content _confirmation">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f5f0e8] text-[#252525]">
          <LuLockKeyhole size={22} />
        </div>

        <h1 className="sign-content__title">
          Create New Password
        </h1>

        <p className="mt-3 text-center text-sm leading-relaxed text-[#777]">
          Choose a strong new password for your account.
          Make sure you can remember it.
        </p>
      </div>

      <div className="sign__confirmation confirmation">
        <form
          className="confirmation__form form-confirmation"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-confirmation__item">
            <label
              htmlFor="new-password"
              className="mb-2 block text-xs text-[#555]"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                className="form-confirmation__input w-full"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={busy}
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-[#777] hover:text-black"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <LuEyeOff size={16} />
                ) : (
                  <LuEye size={16} />
                )}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-[#888]">
              Use at least 8 characters.
            </p>
          </div>

          <div className="form-confirmation__item">
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-xs text-[#555]"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                className="form-confirmation__input w-full"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={busy}
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-[#777] hover:text-black"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                {showConfirmPassword ? (
                  <LuEyeOff size={16} />
                ) : (
                  <LuEye size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="form-confirmation__item _button">
            <button
              type="submit"
              disabled={
                busy ||
                !password ||
                !confirmPassword
              }
              className="form-confirmation__button button sign-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                "Updating Password..."
              ) : (
                <>
                  Reset Password
                  <LuArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs text-[#777] transition hover:text-black"
            >
              <LuArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
