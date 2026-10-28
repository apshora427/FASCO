
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import {
  LuArrowRight,
  LuEye,
  LuEyeOff,
} from "react-icons/lu"

import AuthLayout from "../components/AuthLayout"
import GoogleAuthButton from "../components/GoogleAuthButton"
import { UseUser } from "../context/UserContext"

import signinImage from "../assets/reference/auth/signin.jpg"
import emailIcon from "../assets/reference/auth/email.svg"

export default function Log_In() {
  const location = useLocation()
  const [email, setEmail] = useState(() => location.state?.email || "")
  const [password, setPassword] = useState("")
  const [accountRole, setAccountRole] = useState(() => {
    const intendedPath =
      typeof location.state?.from === "string"
        ? location.state.from
        : location.state?.from?.pathname
    return intendedPath?.startsWith("/admin") ? "admin" : "user"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [busy, setBusy] = useState(false)

  const { LogInUser, googleSignIn } = UseUser()
  const navigate = useNavigate()

  const requestedLocation = location.state?.from
  const requestedPath =
    typeof requestedLocation === "string"
      ? requestedLocation
      : requestedLocation?.pathname

  function navigateAfterLogin(user) {
    const isAdminPath = requestedPath?.startsWith("/admin")
    const isSafeDestination =
      requestedPath?.startsWith("/") &&
      !requestedPath.startsWith("//") &&
      !["/login", "/sign_up", "/confirmation", "/forget-password"].includes(requestedPath) &&
      (!isAdminPath || user.role === "admin")
    const destination = isSafeDestination
      ? requestedPath +
        (typeof requestedLocation === "object"
          ? `${requestedLocation.search || ""}${requestedLocation.hash || ""}`
          : "")
      : user.role === "admin"
        ? "/admin"
        : "/"
    navigate(destination, { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.")
      return
    }

    setBusy(true)

    try {
      const user = await LogInUser(email.trim(), password, rememberMe, accountRole)
      if (user) navigateAfterLogin(user)
    } catch {
      // UserContext handles the login error.
      // Keep the form values so the user can try again.
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleCredential(credential) {
    setBusy(true)
    try {
      const user = await googleSignIn(credential, rememberMe, accountRole)
      navigateAfterLogin(user)
    } catch {
      // UserContext displays the authentication error.
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout variant="login" image={signinImage}>
      <div className="sign__content sign-content">
        <h1 className="sign-content__title">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-sm text-[#777]">
          Sign in to continue your FASCO experience.
        </p>
      </div>

      <div className="sign__signup signup">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <GoogleAuthButton
            label="Continue with Google"
            onCredential={handleGoogleCredential}
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("login-email")?.focus()
            }
            className="flex min-h-10 items-center justify-center gap-2 rounded border border-[#dedfe1] px-2 text-[10px] text-[#333] transition hover:border-[#999]"
          >
            <img
              src={emailIcon}
              alt=""
              className="h-3.5 w-3.5"
            />
            <span>Continue with Email</span>
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 text-[11px] text-[#777]">
          <span className="h-px flex-1 bg-[#dedfe1]" />
          <span>OR SIGN IN WITH EMAIL</span>
          <span className="h-px flex-1 bg-[#dedfe1]" />
        </div>

        <form
          className="form-signup"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-signup__input-block">
            <div className="form-signup__item">
              <label htmlFor="login-account-role" className="mb-2 block text-xs text-[#666]">
                Sign in to
              </label>
              <select
                id="login-account-role"
                className="form-signup__input w-full"
                value={accountRole}
                onChange={(event) => setAccountRole(event.target.value)}
                disabled={busy}
              >
                <option value="user">Customer account</option>
                <option value="admin">Administrator account</option>
              </select>
            </div>
            <div className="form-signup__item">
              <input
                id="login-email"
                className="form-signup__input w-full"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <div className="relative">
                <input
                  className="form-signup__input w-full"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={busy}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-[#777] transition hover:text-black"
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
            </div>
          </div>

          <div className="my-4 flex items-center justify-between gap-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-[#666]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-black"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>

            <Link
              to="/forget-password"
              className="text-[#555] underline-offset-4 transition hover:text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="form-signup__item _button">
            <button
              type="submit"
              disabled={busy}
              className="form-signup__button button sign-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <LuArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="form-signup__item">
            <p className="form-signup__link text-center">
              Don't have an account?{" "}
              <Link to="/sign_up" state={{ from: requestedLocation }}>Create Account</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
