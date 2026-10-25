import { Link } from "react-router"
import editorialImage from "../assets/auth/auth-editorial.png"
import signupImage from "../assets/auth/auth-signup.png"

const AuthLayout = ({ title, children, signup = false }) => (
  <main className="min-h-screen bg-[#f7f7f7] px-5 pb-10 pt-3 text-[#101010]">
    <h1 className="auth-page-title font-light text-[#b7b7b7]">{title}</h1>
    <section className="auth-card mx-auto mt-2 grid w-full max-w-[1400px] overflow-hidden rounded-[10px] border border-[#e7e7e7] bg-white md:grid-cols-[46%_54%]">
      <div className="hidden overflow-hidden bg-[#f4f4f4] md:block"><img src={signup ? signupImage : editorialImage} alt="Fashion editorial" className="h-full w-full object-cover" /></div>
      <div className="relative flex flex-col px-[clamp(32px,5vw,84px)] pb-[clamp(28px,3vw,56px)] pt-[clamp(28px,3vw,56px)]"><Link to="/" className="auth-logo font-Display font-semibold tracking-[-.04em] text-[#454545]">FASCO</Link><div className="mt-[clamp(28px,4vw,62px)] flex flex-1 flex-col">{children}</div><p className="auth-small mt-5 text-right text-[#202020]">FASCO Terms &amp; Conditions</p></div>
    </section>
  </main>
)

export const AuthInput = ({ label, type = "text", ...props }) => <label className="block"><span className="sr-only">{label}</span><input type={type} placeholder={label} className="auth-input w-full border-b border-[#dddddd] bg-transparent text-[#222] outline-none placeholder:text-[#adadad] focus:border-black" {...props} /></label>
export const AuthButton = ({ children, variant = "dark", ...props }) => <button type="submit" className={`auth-button w-full rounded-[3px] font-medium transition-opacity hover:opacity-85 ${variant === "dark" ? "bg-black text-white shadow-[0_4px_10px_rgba(0,0,0,.2)]" : "border border-[#97b8ff] bg-white text-[#4d7ee8]"}`} {...props}>{children}</button>
export default AuthLayout
