import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import {
  LuArrowRight,
  LuCamera,
  LuCheck,
  LuClock3,
  LuLockKeyhole,
  LuPackage,
  LuRefreshCw,
  LuShieldCheck,
  LuUserRound,
} from "react-icons/lu"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { changePassword, getMyOrders, requestEmailChange, updateProfile, verifyEmailChange } from "../api/backend"
import { UseUser } from "../context/UserContext"

const TABS = [
  { id: "profile", label: "Personal details", icon: LuUserRound },
  { id: "orders", label: "Your orders", icon: LuPackage },
  { id: "security", label: "Sign-in & security", icon: LuShieldCheck },
]

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
})

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`

async function preparePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image")
  }
  const source = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = source
    await image.decode()
    const scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Could not process this photo")
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.82, 0.7, 0.58, 0.45]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality)
      if (dataUrl.length <= 80_000) return dataUrl
    }
    throw new Error("Choose a smaller photo")
  } finally {
    URL.revokeObjectURL(source)
  }
}

const StatusPill = ({ status }) => (
  <span className={`account-status account-status-${status}`}>
    <span />
    {status}
  </span>
)

export default function Account() {
  const { currentUser, applyAccountUpdate } = UseUser()
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState(currentUser?.name || "")
  const [phone, setPhone] = useState(currentUser?.phone || "")
  const [photo, setPhoto] = useState(currentUser?.avatar || "")
  const [savingProfile, setSavingProfile] = useState(false)
  const [email, setEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [orderRefreshKey, setOrderRefreshKey] = useState(0)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [busyEmail, setBusyEmail] = useState(false)
  const photoInput = useRef(null)

  useEffect(() => {
    setName(currentUser?.name || "")
    setPhone(currentUser?.phone || "")
    setPhoto(currentUser?.avatar || "")
  }, [currentUser?.id, currentUser?.name, currentUser?.phone, currentUser?.avatar])

  useEffect(() => {
    let active = true
    setOrdersLoading(true)
    setOrdersError("")
    getMyOrders()
      .then((response) => {
        if (!active) return
        if (response?.success && Array.isArray(response.orders)) setOrders(response.orders)
        else setOrdersError(response?.message || "We couldn't load your orders. Please try again.")
      })
      .catch(() => {
        if (active) setOrdersError("We couldn't load your orders. Please try again.")
      })
      .finally(() => {
        if (active) setOrdersLoading(false)
      })
    return () => { active = false }
  }, [orderRefreshKey])

  const saveProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const result = await updateProfile({ name: name.trim(), phone: phone.trim(), avatar: photo || "" })
      if (!result?.success || !result.user) {
        toast.error(result?.message || "Could not save your profile")
        return
      }
      applyAccountUpdate(result.user)
      toast.success("Your profile is up to date")
    } finally {
      setSavingProfile(false)
    }
  }

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setPhoto(await preparePhoto(file))
    } catch (error) {
      toast.error(error.message || "Could not use that photo")
    }
  }

  const sendEmailCode = async (event) => {
    event.preventDefault()
    setBusyEmail(true)
    try {
      const result = await requestEmailChange(email.trim())
      if (!result?.success) {
        toast.error(result?.message || "Could not send a confirmation code")
        return
      }
      setEmailCodeSent(true)
      toast.success(result.message)
      if (result.devCode) toast.info(`Development confirmation code: ${result.devCode}`)
    } finally {
      setBusyEmail(false)
    }
  }

  const confirmEmailChange = async (event) => {
    event.preventDefault()
    setBusyEmail(true)
    try {
      const result = await verifyEmailChange(emailCode.trim())
      if (!result?.success || !result.user) {
        toast.error(result?.message || "Could not verify this email")
        return
      }
      window.dispatchEvent(new CustomEvent("fasco:account:email-changed", {
        detail: { oldEmail: currentUser?.email, newEmail: result.user.email },
      }))
      applyAccountUpdate(result.user, result.accesstoken)
      setEmail("")
      setEmailCode("")
      setEmailCodeSent(false)
      toast.success("Your new email is verified")
    } finally {
      setBusyEmail(false)
    }
  }

  const saveNewPassword = async (event) => {
    event.preventDefault()
    setSavingPassword(true)
    try {
      const result = await changePassword(currentPassword, newPassword, confirmPassword)
      if (!result?.success || !result.user) {
        toast.error(result?.message || "Could not change your password")
        return
      }
      applyAccountUpdate(result.user, result.accesstoken)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Your password has been changed")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <main className="account-page min-h-screen bg-[#f7f6f3]">
      <Navbar variant="shop" />
      <div className="account-wrap mx-auto w-full max-w-[1250px] px-4 pb-20 pt-9 sm:px-7 lg:px-10 lg:pt-14">
        <div className="account-welcome mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="account-eyebrow">YOUR FASCO</p>
            <h1 className="mt-2 font-Display text-[clamp(34px,4vw,50px)] leading-tight text-[#262421]">
              Your account<span className="text-[#d69a49]">.</span>
            </h1>
            <p className="mt-2 text-sm text-[#85817b]">A considered place for your details, orders, and preferences.</p>
          </div>
          <div className="account-member-chip">
            <span className="account-member-dot" />
            MEMBER SINCE {currentUser?.createdAt ? formatDate(currentUser.createdAt) : "TODAY"}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="account-sidebar self-start">
            <div className="account-identity">
              <div className="account-avatar">
                {photo ? <img src={photo} alt={`${currentUser?.name || "Your"} profile`} /> : <span>{(currentUser?.name || "F").charAt(0).toUpperCase()}</span>}
                <button type="button" onClick={() => photoInput.current?.click()} aria-label="Change profile photo">
                  <LuCamera size={15} />
                </button>
                <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto} />
              </div>
              <h2>{currentUser?.name}</h2>
              <p>{currentUser?.email}</p>
              <span className="account-member-badge"><LuShieldCheck size={13} /> Verified customer</span>
            </div>
            <nav className="account-tabs" aria-label="Account sections">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? "page" : undefined} className={activeTab === id ? "is-active" : ""}>
                  <Icon size={17} />
                  <span>{label}</span>
                  {activeTab === id && <LuArrowRight className="ml-auto" size={15} />}
                </button>
              ))}
            </nav>
            <div className="account-sidebar-foot">
              <span><LuLockKeyhole size={15} /> Your account is protected</span>
              <Link to="/shop">Continue shopping <LuArrowRight size={14} /></Link>
            </div>
          </aside>

          <section className="account-content">
            {activeTab === "profile" && (
              <div className="account-panel">
                <div className="account-panel-head">
                  <div>
                    <p className="account-eyebrow">PROFILE</p>
                    <h2>Personal details</h2>
                    <p>Keep your contact details current for a more personal experience.</p>
                  </div>
                  <span className="account-panel-icon"><LuUserRound size={20} /></span>
                </div>
                <form onSubmit={saveProfile} className="account-form">
                  <div className="account-form-grid">
                    <label className="account-field account-field-wide">
                      <span>Full name</span>
                      <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
                    </label>
                    <label className="account-field">
                      <span>Email address</span>
                      <input value={currentUser?.email || ""} readOnly aria-describedby="email-edit-help" />
                      <small id="email-edit-help">Change this securely in Sign-in &amp; security.</small>
                    </label>
                    <label className="account-field">
                      <span>Phone number</span>
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="Add a phone number" />
                    </label>
                  </div>
                  <div className="account-form-foot">
                    <span>Your photo is stored securely with your account.</span>
                    <button className="account-primary" type="submit" disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save changes"} <LuCheck size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="account-panel">
                <div className="account-panel-head">
                  <div>
                    <p className="account-eyebrow">YOUR PURCHASES</p>
                    <h2>Order history</h2>
                    <p>Every order, together in one place.</p>
                  </div>
                  <button type="button" className="account-icon-button" onClick={() => setOrderRefreshKey((key) => key + 1)} aria-label="Refresh orders">
                    <LuRefreshCw size={17} className={ordersLoading ? "animate-spin" : ""} />
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="account-orders-loading"><span className="account-spinner" /> Loading your orders…</div>
                ) : ordersError ? (
                  <div className="account-message account-message-error" role="status">{ordersError}</div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-orders">
                    <span><LuPackage size={23} /></span>
                    <h3>Your next favorite is waiting.</h3>
                    <p>Orders you place while signed in will appear here.</p>
                    <Link to="/shop" className="account-primary">Explore the collection <LuArrowRight size={15} /></Link>
                  </div>
                ) : (
                  <div className="account-order-list">
                    {orders.map((order) => (
                      <article key={order._id} className="account-order">
                        <div className="account-order-head">
                          <div>
                            <span className="account-order-number">{order.orderNumber}</span>
                            <p><LuClock3 size={13} /> Placed {formatDate(order.createdAt)}</p>
                          </div>
                          <StatusPill status={order.status} />
                        </div>
                        <div className="account-order-items">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="account-order-item">
                              <span>{item.title}</span>
                              <span>× {item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && <p className="account-order-more">+ {order.items.length - 3} more item(s)</p>}
                        </div>
                        <div className="account-order-total">
                          <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                          <strong>{formatMoney(order.total)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-5">
                <section className="account-panel">
                  <div className="account-panel-head">
                    <div>
                      <p className="account-eyebrow">ACCOUNT IDENTITY</p>
                      <h2>Email address</h2>
                      <p>We’ll verify the new address before making any change.</p>
                    </div>
                    <span className="account-panel-icon"><LuShieldCheck size={20} /></span>
                  </div>
                  <form onSubmit={emailCodeSent ? confirmEmailChange : sendEmailCode} className="account-security-form">
                    <label className="account-field">
                      <span>Current email</span>
                      <input value={currentUser?.email || ""} readOnly />
                    </label>
                    <label className="account-field">
                      <span>{emailCodeSent ? "New email address" : "New email address"}</span>
                      <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={emailCodeSent || busyEmail} required />
                    </label>
                    {emailCodeSent && (
                      <label className="account-field">
                        <span>Confirmation code</span>
                        <input inputMode="numeric" autoComplete="one-time-code" value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} required />
                      </label>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={busyEmail} className="account-primary">
                        {busyEmail ? "Please wait…" : emailCodeSent ? "Verify new email" : "Send confirmation code"} <LuArrowRight size={15} />
                      </button>
                      {emailCodeSent && <button type="button" className="account-secondary" onClick={() => { setEmailCodeSent(false); setEmailCode("") }}>Use another email</button>}
                    </div>
                  </form>
                </section>

                <section className="account-panel">
                  <div className="account-panel-head">
                    <div>
                      <p className="account-eyebrow">PASSWORD</p>
                      <h2>Update your password</h2>
                      <p>Choose a strong password you don’t use anywhere else.</p>
                    </div>
                    <span className="account-panel-icon"><LuLockKeyhole size={20} /></span>
                  </div>
                  <form onSubmit={saveNewPassword} className="account-security-form">
                    <label className="account-field">
                      <span>Current password</span>
                      <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                    </label>
                    <div className="account-form-grid">
                      <label className="account-field">
                        <span>New password</span>
                        <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} maxLength={12} required />
                      </label>
                      <label className="account-field">
                        <span>Confirm new password</span>
                        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} maxLength={12} required />
                      </label>
                    </div>
                    <p className="account-password-hint">6–12 characters, including uppercase, lowercase, a number, and a symbol.</p>
                    <button type="submit" disabled={savingPassword} className="account-primary">
                      {savingPassword ? "Updating…" : "Update password"} <LuArrowRight size={15} />
                    </button>
                    <p className="account-password-hint">
                      Using Google or forgot your current password?{" "}
                      <Link className="font-semibold text-[#a26d26] underline-offset-2 hover:underline" to="/forget-password" state={{ email: currentUser?.email }}>
                        Set a new password with email verification
                      </Link>
                    </p>
                  </form>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
