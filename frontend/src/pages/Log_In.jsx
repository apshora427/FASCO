import { Link, useNavigate } from "react-router"
import AuthLayout, { AuthButton, AuthInput } from "../components/AuthLayout"

const Log_In = () => {
  const navigate = useNavigate()
  return <AuthLayout title="Sign In"><h2 className="auth-section-title font-Display font-semibold">Sign In To FASCO</h2><div className="mt-3 grid grid-cols-2 gap-3"><button className="auth-provider rounded-[3px] border border-[#9ab7ef]"><b className="mr-2 text-[11px] text-[#4285f4]">G</b> Sign up with Google</button><button className="auth-provider rounded-[3px] border border-[#9ab7ef]"><b className="mr-2 text-[10px] text-[#ea4335]">M</b> Sign up with Email</button></div><p className="auth-or my-6 text-center font-semibold tracking-[.25em] text-[#888]">— OR —</p><form onSubmit={(event) => { event.preventDefault(); navigate("/") }} className="space-y-1"><AuthInput label="Email" type="email" required /><AuthInput label="Password" type="password" required /><div className="pt-3"><AuthButton>Sign In</AuthButton></div></form><Link to="/sign_up" className="mt-2"><AuthButton type="button" variant="light">Register Now</AuthButton></Link><Link to="/forget-password" className="auth-small mt-2 text-right text-[#5182ea]">Forgot Password?</Link></AuthLayout>
}
export default Log_In
