import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-toastify"
import googleIcon from "../assets/reference/auth/google.svg"

export default function GoogleAuthButton({ label, onCredential }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => toast.info("Google sign-in is not configured yet.")}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded border border-[#dedfe1] px-2 text-[10px] text-[#777] transition hover:border-[#999]"
        aria-label={`${label} (not configured)`}
      >
        <img src={googleIcon} alt="" className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="flex min-h-10 items-center justify-center overflow-hidden rounded">
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) onCredential(response.credential)
          else toast.error("Google did not return a sign-in credential.")
        }}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
        text={label.toLowerCase().includes("sign up") ? "signup_with" : "continue_with"}
        shape="rectangular"
        size="large"
        width="180"
      />
    </div>
  )
}
