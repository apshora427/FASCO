import { useNavigate } from "react-router"
import AuthLayout, { AuthButton, AuthInput } from "../components/AuthLayout"

const EnterNewPassword = () => {
  const navigate = useNavigate()
  return <AuthLayout title="Enter New Password"><h2 className="auth-section-title font-Display font-semibold">Enter Your New Password</h2><form onSubmit={(event) => { event.preventDefault(); navigate("/login") }} className="mt-7 space-y-1"><AuthInput label="New Password" type="password" required /><AuthInput label="Confirmation Password" type="password" required /><div className="pt-5"><AuthButton variant="light">Submit</AuthButton></div></form></AuthLayout>
}
export default EnterNewPassword
