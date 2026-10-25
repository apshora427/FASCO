import { Link, useNavigate } from "react-router"
import AuthLayout, { AuthButton, AuthInput } from "../components/AuthLayout"

const Sign_Up = () => {
  const navigate = useNavigate()
  return <AuthLayout title="Signup" signup><h2 className="auth-section-title font-Display font-semibold">Create Account</h2><div className="mt-3 grid grid-cols-2 gap-3"><button className="auth-provider rounded-[3px] border border-[#9ab7ef]"><b className="mr-2 text-[10px] text-[#4285f4]">G</b> Sign up with Google</button><button className="auth-provider rounded-[3px] border border-[#9ab7ef]"><b className="mr-2 text-[9px] text-[#ea4335]">M</b> Sign up with Email</button></div><p className="auth-small my-4 text-center font-semibold tracking-[.25em] text-[#888]">— OR —</p><form onSubmit={(event) => { event.preventDefault(); navigate("/") }} className="grid grid-cols-2 gap-x-3 gap-y-1"><AuthInput label="First Name" required /><AuthInput label="Last Name" required /><AuthInput label="Email Address" type="email" required /><AuthInput label="Phone Number" type="tel" /><AuthInput label="Password" type="password" required /><AuthInput label="Confirm Password" type="password" required /><div className="col-span-2 pt-3"><AuthButton>Create Account</AuthButton></div></form><p className="auth-small mt-3 text-center">Already have an account? <Link className="text-[#5182ea]" to="/login">Login</Link></p></AuthLayout>
}
export default Sign_Up
