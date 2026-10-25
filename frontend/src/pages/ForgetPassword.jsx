import { Link, useNavigate } from "react-router"
import AuthLayout, { AuthButton, AuthInput } from "../components/AuthLayout"

const ForgetPassword = () => {
  const navigate = useNavigate()
  return <AuthLayout title="Forget Password"><h2 className="auth-section-title font-Display font-semibold">Forget Password</h2><form onSubmit={(event) => { event.preventDefault(); navigate("/confirmation") }} className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1"><AuthInput label="First Name" required /><AuthInput label="Last Name" required /><AuthInput label="Email Address" type="email" required /><AuthInput label="Phone Number" type="tel" /><div className="col-span-2 pt-3"><AuthButton>Send Confirmation Code</AuthButton></div></form><p className="auth-small mt-3 text-center">Already have an account? <Link className="text-[#5182ea]" to="/login">Login</Link></p></AuthLayout>
}
export default ForgetPassword
