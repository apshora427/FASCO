import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "react-toastify"
import AuthLayout from "../components/AuthLayout"
import { setNewPassword } from "../api/backend"
import confirmationImage from "../assets/reference/auth/confirmation.jpg"

const EnterNewPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams() // the confirmation code from the email
  const [passwords, setPasswords] = useState({ pass: "", confirm: "" })
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => setPasswords((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (passwords.pass !== passwords.confirm) {
      toast.error("Passwords do not match")
      return
    }
    setBusy(true)
    const res = await setNewPassword(token, passwords.pass, passwords.confirm)
    setBusy(false)
    if (res?.success) {
      toast.success(res.message || "Password changed successfully")
      navigate("/login")
    } else {
      toast.error(res?.message || "Could not reset the password")
    }
  }

  return (
    <AuthLayout variant="confirmation" image={confirmationImage}>
      <div className="sign__content sign-content _confirmation">
        <h1 className="sign-content__title">Enter New Password</h1>
      </div>
      <div className="sign__confirmation confirmation">
        <form className="confirmation__form form-confirmation" onSubmit={submit}>
          <div className="form-confirmation__item">
            <input
              className="form-confirmation__input"
              type="password"
              placeholder="New Password"
              autoComplete="new-password"
              value={passwords.pass}
              onChange={set("pass")}
              required
            />
          </div>
          <div className="form-confirmation__item">
            <input
              className="form-confirmation__input"
              type="password"
              placeholder="Confirmation Password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={set("confirm")}
              required
            />
          </div>
          <div className="form-confirmation__item _button">
            <button type="submit" disabled={busy} className="form-confirmation__button button sign-button sign-button_blue">
              {busy ? "Saving…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default EnterNewPassword