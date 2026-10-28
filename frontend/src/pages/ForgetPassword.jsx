import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"
import AuthLayout from "../components/AuthLayout"
import { forgotPassword } from "../api/backend"
import forgetImage from "../assets/reference/auth/forget.jpg"

const ForgetPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)

  // asks the backend to email a reset code, then continues into the shared
  // Confirmation screen (flow: reset → new-password screen after the code)
  const submit = async (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid Email")
      return
    }
    setBusy(true)
    const res = await forgotPassword(email)
    setBusy(false)
    if (res?.success) {
      toast.success(res.message || "Check your email for the confirmation code")
      if (res.devCode) toast.info(`Dev code: ${res.devCode}`)
      navigate("/confirmation", { state: { flow: "reset", email } })
    } else {
      toast.error(res?.message || "Could not reach the server")
    }
  }

  return (
    <AuthLayout variant="forget" image={forgetImage}>
      <div className="sign__content sign-content _forget">
        <h1 className="sign-content__title">Forget Password</h1>
      </div>
      <div className="sign__forget forget">
        <form className="forget__form form-forget" onSubmit={submit}>
          <div className="form-forget__input-block">
            <div className="form-forget__item">
              <input
                className="form-forget__input"
                type="text"
                placeholder="First Name"
                autoComplete="given-name"
                required
              />
            </div>
            <div className="form-forget__item">
              <input
                className="form-forget__input"
                type="text"
                placeholder="Last Name"
                autoComplete="family-name"
                required
              />
            </div>
            <div className="form-forget__item">
              <input
                className="form-forget__input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="form-forget__item">
              <input
                className="form-forget__input"
                type="tel"
                placeholder="Phone Number"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="form-forget__item _button">
            <button type="submit" disabled={busy} className="form-forget__button button sign-button">
              {busy ? "Sending…" : "Send Confirmation Code"}
            </button>
          </div>
          <div className="form-forget__item">
            <div className="form-forget__link">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default ForgetPassword