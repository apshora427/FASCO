import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

// Local stand-in for the auth layer while the frontend is being built.
// It exposes exactly the same surface as the guide project's UserContext
// (currentUser, isGuest, loading, addUser, LogInUser, googleSignUp,
// enterGuestMode, logOut) so the pages written against it keep working when
// the real Express backend lands — only the bodies change.
export const UserContext = createContext()

const ACCOUNTS_KEY = "fasco_accounts"
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

  useEffect(() => {
    const session = readJSON(SESSION_KEY, null)
    if (session?.user) {
      setCurrentUser(session.user)
      setIsGuest(false)
    } else if (session?.guest) {
      setIsGuest(true)
    }
    setLoading(false)
  }, [])

  const toastify = (type, massage) => {
    type === "success" && toast.success(massage)
    type === "error" && toast.error(massage)
  }

  const persist = (user, guest) => {
    setCurrentUser(user)
    setIsGuest(guest)
    writeJSON(SESSION_KEY, { user, guest })
  }

  // Register an account. Does NOT sign the user in — the Figma flow sends the
  // user to the Confirmation screen (code emailed) before they can log in.
  function addUser(name, email, password) {
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

    const accounts = readJSON(ACCOUNTS_KEY, {})
    if (accounts[email.toLowerCase()]) {
      toastify("error", "Email already in use")
      return Promise.reject(new Error("email-already-in-use"))
    }

    accounts[email.toLowerCase()] = { name, email, password }
    writeJSON(ACCOUNTS_KEY, accounts)
    toastify("success", "Confirmation code sent to your email")
    return Promise.resolve({ name, email })
  }

  function LogInUser(email, password) {
    const accounts = readJSON(ACCOUNTS_KEY, {})
    const account = accounts[(email || "").toLowerCase()]

    if (!account || account.password !== password) {
      toastify("error", "Invalid email or password")
      return Promise.reject(new Error("invalid credentials"))
    }

    persist({ name: account.name, email: account.email }, false)
    toastify("success", "Successfully logged in")
    return Promise.resolve({ name: account.name, email: account.email })
  }

  function googleSignUp() {
    // TODO: wire the real provider once the backend auth route exists.
    persist({ name: "FASCO Member", email: "member@fasco.dev" }, false)
    toastify("success", "Successfully signed in with Google")
    return Promise.resolve({ name: "FASCO Member", email: "member@fasco.dev" })
  }

  function enterGuestMode() {
    persist(null, true)
    toastify("success", "Browsing as a guest")
  }

  function logOut() {
    persist(null, false)
    toastify("success", "Logged out")
    return Promise.resolve()
  }

  return (
    <UserContext.Provider value={{ currentUser, isGuest, loading, addUser, LogInUser, googleSignUp, enterGuestMode, logOut }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserProvider

export const UseUser = () => useContext(UserContext)
