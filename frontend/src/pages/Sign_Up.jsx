
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import AuthLayout from "../components/AuthLayout"
import GoogleAuthButton from "../components/GoogleAuthButton"
import { UseUser } from "../context/UserContext"
import signupImage from "../assets/reference/auth/signup.jpg"
import emailIcon from "../assets/reference/auth/email.svg"

export default function Sign_Up() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState(false)

  const { addUser: register, googleSignIn } = UseUser()
  const location = useLocation()
  const navigate = useNavigate()

  const requestedLocation = location.state?.from
  const requestedPath = typeof requestedLocation === "string"
    ? requestedLocation
    : requestedLocation?.pathname
  const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedLocation
    : "/"

  async function handleGoogleCredential(credential) {
    setBusy(true)
    try {
      const user = await googleSignIn(credential)
      navigate(user.role === "admin" ? "/admin" : destination, { replace: true })
    } catch {
      // UserContext displays the authentication error.
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = `${firstName.trim()} ${lastName.trim()}`.trim()

    if (!firstName.trim() || !lastName.trim() || !email.trim() ||
        !phone.trim() || !password || !confirmPassword) {
      toast.error("Please complete all fields.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setBusy(true)

    try {
      const result = await register(name, email.trim(), password, phone.trim())

      navigate("/confirmation", {
        replace: true,
        state: {
          flow: "signup",
          email: email.trim(),
          from: requestedLocation,
        },
      })

      if (result?.devCode) {
        toast.info(`Development confirmation code: ${result.devCode}`)
      }
    } catch {
      // UserContext displays the backend error.
      // Keep the entered fields so the user can correct them.
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout variant="signup" image={signupImage}>
      <div className="sign__content sign-content _signup">
        <h1 className="sign-content__title">Create Account</h1>
      </div>

      <div className="sign__signup signup">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <GoogleAuthButton
            label="Sign up with Google"
            onCredential={handleGoogleCredential}
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("signup-first-name")?.focus()
            }
            className="flex min-h-9 items-center justify-center gap-2 rounded border border-[#dedfe1] px-2 text-[10px] text-[#333] transition hover:border-[#999]"
          >
            <img src={emailIcon} alt="" className="h-3.5 w-3.5" />
            <span>Sign up with Email</span>
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 text-[11px] text-[#777]">
          <span className="h-px flex-1 bg-[#dedfe1]" />
          <span>OR</span>
          <span className="h-px flex-1 bg-[#dedfe1]" />
        </div>

        <form
          className="form-signup"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-signup__input-block">
            <div className="form-signup__item">
              <input
                id="signup-first-name"
                className="form-signup__input w-full"
                type="text"
                placeholder="First Name"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <input
                className="form-signup__input w-full"
                type="text"
                placeholder="Last Name"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <input
                className="form-signup__input w-full"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <input
                className="form-signup__input w-full"
                type="tel"
                placeholder="Phone Number"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <input
                className="form-signup__input w-full"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className="form-signup__item">
              <input
                className="form-signup__input w-full"
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={busy}
                required
              />
            </div>
          </div>

          <div className="form-signup__item _button">
            <button
              type="submit"
              disabled={busy}
              className="form-signup__button button sign-button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating Account…" : "Create Account"}
            </button>
          </div>

          <div className="form-signup__item">
            <p className="form-signup__link text-center">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
