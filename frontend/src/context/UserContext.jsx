import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  registerUser,
  verifyEmail,
  loginUser,
  googleLoginUser,
  logoutUser,
  fetchCurrentUser,
  getAuthToken,
  setAuthToken,
} from "../api/backend"

// Auth layer backed by the Express backend (src/controllers/auth.controller.js).
// Exposes the same surface the pages were written against — currentUser,
// isGuest, loading, addUser, LogInUser, googleSignIn, enterGuestMode, logOut —
// plus isAdmin/verifyCode helpers for the confirmation flow and dashboard.
export const UserContext = createContext()

const SESSION_KEY = "fasco_session"

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // storage unavailable — in-memory authentication still works
  }
}

const writeGuestSession = () => {
  clearSession()
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ guest: true }))
  } catch {
    // storage unavailable — guest mode lasts for this page load
  }
}

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])^[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{6,12}$/
  const nameRegex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/

  // Restore a saved guest session and derive signed-in identity from /me.
  useEffect(() => {
    const session = readJSON(SESSION_KEY, null)
    if (session?.guest && !session?.user) setIsGuest(true)

    const token = getAuthToken()
    if (!token) {
      if (session?.user) clearSession()
      setLoading(false)
      return
    }

    let alive = true
    fetchCurrentUser()
      .then((res) => {
        if (!alive) return
        if (res?.success && res.user && ["user", "admin"].includes(res.user.role)) {
          setCurrentUser(res.user)
          setIsGuest(false)
          clearSession()
        } else if (res) {
          setAuthToken("")
          clearSession()
          setCurrentUser(null)
          setIsGuest(false)
        }
        setLoading(false)
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const toastify = (type, massage) => {
    type === "success" && toast.success(massage)
    type === "error" && toast.error(massage)
  }

  const persist = (user, guest, token, rememberMe = false) => {
    setCurrentUser(user)
    setIsGuest(guest)
    if (user && token) {
      clearSession()
      setAuthToken(token, rememberMe)
    } else {
      setAuthToken("")
      if (guest) writeGuestSession()
      else clearSession()
    }
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
  async function confirmCode(email, code) {
    const res = await verifyEmail(email, code)
    if (res?.success) {
      toastify("success", res.message || "Email verified")
      return Promise.resolve(res)
    }
    toastify("error", res?.message || "Invalid confirmation code")
    return Promise.reject(new Error("invalid-code"))
  }

  async function LogInUser(email, password, rememberMe = false, role = "user") {
    if (!email || !password) {
      toastify("error", "Please enter your email and password")
      return Promise.reject(new Error("missing fields"))
    }

    const res = await loginUser({ email, password, role })
    if (res?.success && res.userInfo) {
      const { accesstoken, ...user } = res.userInfo
      persist(user, false, accesstoken, rememberMe)
      toastify("success", res.message || "Successfully logged in")
      return Promise.resolve(user)
    }
    toastify("error", res?.message || "Could not reach the server")
    return Promise.reject(new Error("invalid credentials"))
  }

  async function googleSignIn(credential, rememberMe = false, role = "user") {
    const res = await googleLoginUser(credential, role)
    if (res?.success && res.userInfo) {
      const { accesstoken, ...user } = res.userInfo
      persist(user, false, accesstoken, rememberMe)
      toastify("success", res.message || "Successfully signed in with Google")
      return user
    }
    toastify("error", res?.message || "Google sign-in failed")
    throw new Error("google-sign-in-failed")
  }

  function enterGuestMode() {
    persist(null, true)
    toastify("success", "Browsing as a guest")
  }

  async function logOut() {
    const result = await logoutUser()
    persist(null, false, "")
    if (result?.success) toastify("success", result.message || "Logged out")
    else toastify("error", "Signed out on this device; the server session could not be revoked.")
  }

  function applyAccountUpdate(user, token) {
    if (user) setCurrentUser(user)
    if (token) {
      let rememberMe = false
      try {
        rememberMe = localStorage.getItem("fasco_token") === getAuthToken()
      } catch {
        // Keep the updated token for this page session if storage is unavailable.
      }
      setAuthToken(token, rememberMe)
    }
  }

  const isAdmin = currentUser?.role === "admin"

  // re-check the token periodicaily so a session that changed roles on the
  // server (or expired) is reflected immediately without a full reload
  useEffect(() => {
    if (!currentUser) return
    const t = setInterval(async () => {
      const res = await fetchCurrentUser()
      if (res?.success && res.user && ["user", "admin"].includes(res.user.role)) {
        setCurrentUser(res.user)
      } else if (res && getAuthToken()) {
        setAuthToken("")
        clearSession()
        setCurrentUser(null)
        setIsGuest(false)
      }
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
        googleSignIn,
        enterGuestMode,
        logOut,
        applyAccountUpdate,
      }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserProvider

export const UseUser = () => useContext(UserContext)