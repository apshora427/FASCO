import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  registerUser,
  verifyEmail,
  loginUser,
  fetchCurrentUser,
  setAuthToken,
  getAuthToken,
} from "../api/backend"

// Auth layer backed by the Express backend (src/controllers/auth.controller.js).
// Exposes the same surface the pages were written against — currentUser,
// isGuest, loading, addUser, LogInUser, googleSignUp, enterGuestMode, logOut —
// plus isAdmin/verifyCode helpers for the confirmation flow and dashboard.
export const UserContext = createContext()

const SESSION_KEY = "fasco_session"

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable — keep working in memory
  }
}

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])^[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{6,12}$/
  const nameRegex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/

  // boot: restore the guest flag, re-validate a stored token /me, and keep the
  // raw access token in localStorage so a page refresh keeps the admin session
  useEffect(() => {
    const session = readJSON(SESSION_KEY, null)
    if (session?.guest && !session?.user) setIsGuest(true)

    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    let alive = true
    fetchCurrentUser().then((res) => {
      if (!alive) return
      if (res?.success && res.user) {
        setCurrentUser(res.user)
        setIsGuest(false)
        writeJSON(SESSION_KEY, { user: res.user, guest: false })
      } else {
        setAuthToken("") // stale/invalid token — sign out silently
      }
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const toastify = (type, massage) => {
    type === "success" && toast.success(massage)
    type === "error" && toast.error(massage)
  }

  const persist = (user, guest, token) => {
    setCurrentUser(user)
    setIsGuest(guest)
    writeJSON(SESSION_KEY, { user, guest })
    if (token) setAuthToken(token)
  }

  // Register an account. Does NOT sign the user in — the Figma flow sends the
  // user to the Confirmation screen (code emailed) before they can log in.
  async function addUser(name, email, password, phone = "") {
    if (!name || !email || !password) {
      toastify("error", "Please fill up the form fully to sign up in FASCO")
      return Promise.reject(new Error("missing fields"))
    }
    if (!nameRegex.test(name)) {
      toastify("error", "Name contains invalid characters")
      return Promise.reject(new Error("invalid name"))
    }
    if (!emailRegex.test(email)) {
      toastify("error", "Invalid Email")
      return Promise.reject(new Error("invalid email"))
    }
    if (!passwordRegex.test(password)) {
      toastify("error", "The password must be strong")
      return Promise.reject(new Error("weak password"))
    }

    const res = await registerUser({ name, email, password, phone })
    if (res?.success) {
      toastify("success", res.message || "Confirmation code sent to your email")
      return Promise.resolve({ name, email, devCode: res.devCode })
    }
    toastify("error", res?.message || "Could not reach the server")
    return Promise.reject(new Error("register-failed"))
  }

  // Verify the 6-digit code from the Confirmation screen.
  async function confirmCode(code) {
    const res = await verifyEmail(code)
    if (res?.success) {
      toastify("success", res.message || "Email verified")
      return Promise.resolve(res)
    }
    toastify("error", res?.message || "Invalid confirmation code")
    return Promise.reject(new Error("invalid-code"))
  }

  async function LogInUser(email, password) {
    if (!email || !password) {
      toastify("error", "Please enter your email and password")
      return Promise.reject(new Error("missing fields"))
    }

    const res = await loginUser({ email, password })
    if (res?.success && res.userInfo) {
      const { accesstoken, ...user } = res.userInfo
      persist(user, false, accesstoken)
      toastify("success", res.message || "Successfully logged in")
      return Promise.resolve(user)
    }
    toastify("error", res?.message || "Could not reach the server")
    return Promise.reject(new Error("invalid credentials"))
  }

  function googleSignUp() {
    // TODO: wire the real provider (OAuth client id + backend exchange) —
    // no provider is configured for this project yet.
    persist({ name: "FASCO Member", email: "member@fasco.dev", role: "user" }, false)
    toastify("success", "Successfully signed in with Google")
    return Promise.resolve({ name: "FASCO Member", email: "member@fasco.dev", role: "user" })
  }

  function enterGuestMode() {
    persist(null, true)
    toastify("success", "Browsing as a guest")
  }

  function logOut() {
    setAuthToken("")
    persist(null, false)
    toastify("success", "Logged out")
    return Promise.resolve()
  }

  const isAdmin = currentUser?.role === "admin"

  // re-check the token periodicaily so a session that changed roles on the
  // server (or expired) is reflected immediately without a full reload
  useEffect(() => {
    if (!currentUser) return
    const t = setInterval(async () => {
      const res = await fetchCurrentUser()
      if (res?.success && res.user) setCurrentUser(res.user)
      else if (!res?.success && getAuthToken()) setAuthToken("")
    }, 60_000)
    return () => clearInterval(t)
  }, [currentUser])

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isGuest,
        isAdmin,
        loading,
        addUser,
        confirmCode,
        LogInUser,
        googleSignUp,
        enterGuestMode,
        logOut,
      }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserProvider

export const UseUser = () => useContext(UserContext)