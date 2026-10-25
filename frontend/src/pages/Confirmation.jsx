import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import AuthLayout, { AuthButton } from "../components/AuthLayout"

const Confirmation = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState(Array(6).fill(""))
  const inputs = useRef([])
  const setDigit = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...code]; next[index] = digit; setCode(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }
  return <AuthLayout title="Confirmation Window"><h2 className="auth-section-title font-Display font-semibold">Enter The Confirmation Code</h2><form onSubmit={(event) => { event.preventDefault(); navigate("/enter-new-password/reset") }} className="mt-7"><div className="flex justify-between gap-2">{code.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} value={digit} onChange={(event) => setDigit(event.target.value, index)} onKeyDown={(event) => { if (event.key === "Backspace" && !digit && index) inputs.current[index - 1]?.focus() }} inputMode="numeric" aria-label={`Confirmation digit ${index + 1}`} maxLength="1" className="auth-code border-b border-[#dddddd] text-center outline-none focus:border-black" />)}</div><div className="mt-5"><AuthButton>Recover Account</AuthButton></div></form><p className="auth-small mt-3 text-center">Didn&apos;t receive confirmation code? <button type="button" onClick={() => setCode(Array(6).fill(""))} className="text-[#5182ea]">Resend Now</button></p></AuthLayout>
}
export default Confirmation
