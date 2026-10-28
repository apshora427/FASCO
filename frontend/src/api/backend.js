// Lightweight client for the Express backend in /backend.
// Uses the same env pattern as the reference project: VITE_AUTH_URL.
// Falls back to the local dev server (server.js default port 8000).
const BASE_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/v1"

// Persistent sign-ins use localStorage; temporary sign-ins use sessionStorage.
const TOKEN_KEY = "fasco_token"
export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ""
  } catch {
    return ""
  }
}
export const setAuthToken = (token, rememberMe = true) => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    if (token) {
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(TOKEN_KEY, token)
    }
  } catch {
    // storage unavailable — the in-memory session still works this page load
  }
}

const request = async (path, options = {}) => {
  const { headers, ...rest } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      ...rest,
      signal: rest.signal || controller.signal,
    })
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

// Same request with the admin/user token attached (raw token, backend convention).
const authed = (path, options = {}) => {
  const token = getAuthToken()
  return request(path, {
    ...options,
    headers: { ...(options.headers || {}), ...(token ? { Authorization: token } : {}) },
  })
}

/* ------------------------------------------------------------------ auth */

// POST /register — saves the account in MongoDB via the backend.
// Resolves to the parsed response; never throws (callers treat it as best-effort).
export const registerUser = async ({ name, email, password, phone }) => {
  try {
    return await request("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
  } catch {
    return null
  }
}

// POST /verify — keep one-time codes out of URL histories and access logs.
export const verifyEmail = async (email, code) => {
  try {
    return await request("/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  } catch {
    return null
  }
}

// POST /verify-reset-code — validates a reset code without consuming it.
export const verifyResetCode = async (email, code) => {
  try {
    return await request("/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  } catch {
    return null
  }
}

// POST /revarify-email — "Resend Now" on the Confirmation screen.
export const resendCode = async (email) => {
  try {
    return await request("/revarify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  } catch {
    return null
  }
}

// POST /login — returns { userInfo: { …, role, accesstoken } } or an error body.
export const loginUser = async ({ email, password, role }) => {
  try {
    return await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    })
  } catch {
    return null
  }
}

// POST /google — exchange Google's verified ID credential for a FASCO session.
export const googleLoginUser = async (credential, role = "user") => {
  try {
    return await request("/google", {
      method: "POST",
      body: JSON.stringify({ credential, role }),
    })
  } catch {
    return null
  }
}

// POST /logout — invalidates the current backend token before clearing it locally.
export const logoutUser = async () => {
  try {
    return await authed("/logout", { method: "POST" })
  } catch {
    return null
  }
}

// GET /me — re-validates the stored token when the app boots.
export const fetchCurrentUser = async () => {
  try {
    return await authed("/me")
  } catch {
    return null
  }
}

// PATCH /profile — updates the authenticated account's name, phone, and photo.
export const updateProfile = async (fields) => {
  try {
    return await authed("/profile", {
      method: "PATCH",
      body: JSON.stringify(fields),
    })
  } catch {
    return null
  }
}

// POST /profile/email/request — sends a one-time code to the new address.
export const requestEmailChange = async (email) => {
  try {
    return await authed("/profile/email/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  } catch {
    return null
  }
}

// POST /profile/email/verify — confirms a pending address change.
export const verifyEmailChange = async (code) => {
  try {
    return await authed("/profile/email/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  } catch {
    return null
  }
}

// POST /profile/password — changes a password after checking the current one.
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    return await authed("/profile/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  } catch {
    return null
  }
}

// GET /my-orders — returns only orders linked to the signed-in customer.
export const getMyOrders = async () => {
  try {
    return await authed("/my-orders")
  } catch {
    return null
  }
}

// POST /forgot-password — asks the backend to email a reset code.
export const forgotPassword = async (email) => {
  try {
    return await request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  } catch {
    return null
  }
}

// POST /setnew-password — saves the new password after the emailed code.
export const setNewPassword = async (email, code, newPassword, confirmPassword) => {
  try {
    return await request("/setnew-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword, confirmPassword }),
    })
  } catch {
    return null
  }
}

/* -------------------------------------------------------------- categories */

// GET /category — returns the list of category names (strings).
// Resolves to [] when the DB is empty, or null when the backend is unavailable.
export const getCategories = async () => {
  try {
    const data = await request("/category")
    if (data?.success && Array.isArray(data.category)) {
      return data.category.map((c) => c.categoryName).filter(Boolean)
    }
    return null
  } catch {
    return null
  }
}

// GET /category — returns the full category documents ({ _id, categoryName, ... }).
// Used by the Dashboard so categories can be updated/deleted by id.
// Returns null when the backend is unreachable (callers keep stale data), [] when the DB is empty.
export const getCategoryList = async () => {
  try {
    const data = await request("/category")
    if (data?.success && Array.isArray(data.category)) {
      return data.category
    }
    return []
  } catch {
    return null
  }
}

// POST /category — creates a category in MongoDB.
export const createCategory = async (categoryName) => {
  try {
    return await authed("/category", {
      method: "POST",
      body: JSON.stringify({ categoryName }),
    })
  } catch {
    return null
  }
}

// PUT /category/:id — renames a category in MongoDB.
export const updateCategory = async (id, categoryName) => {
  try {
    return await authed(`/category/${id}`, {
      method: "PUT",
      body: JSON.stringify({ categoryName }),
    })
  } catch {
    return null
  }
}

// DELETE /category/:id — removes a category in MongoDB.
export const deleteCategory = async (id) => {
  try {
    return await authed(`/category/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

/* ---------------------------------------------------------------- products */

// POST /product/create — creates a product (requires an admin JWT in the Authorization header).
export const createProduct = async ({ title, token, ...fields }) => {
  try {
    return await authed("/product/create", {
      method: "POST",
      body: JSON.stringify({ title, ...fields }),
      ...(token ? { headers: { Authorization: token } } : {}),
    })
  } catch {
    return null
  }
}

// PUT /product/:id — admin: update any fields of a product.
export const updateProduct = async (id, fields) => {
  try {
    return await authed(`/product/${id}`, { method: "PUT", body: JSON.stringify(fields) })
  } catch {
    return null
  }
}

// DELETE /product/:id — admin: remove a product.
export const deleteProduct = async (id) => {
  try {
    return await authed(`/product/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

export const uploadProductImage = async (file) => {
  const token = getAuthToken()
  const formData = new FormData()
  formData.append("image", file)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(`${BASE_URL}/product/upload-image`, {
      method: "POST",
      headers: token ? { Authorization: token } : {},
      body: formData,
      signal: controller.signal,
    })
    return await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// GET /product — full product catalogue (optionally filtered by category).
// Returns the product array, or null when the backend is unreachable
// (callers keep their local fallback data in that case).
export const getProducts = async (category) => {
  try {
    const query = category ? `?category=${encodeURIComponent(category)}` : ""
    const data = await request(`/product${query}`)
    if (data?.success && Array.isArray(data.products)) {
      return data.products
    }
    return null
  } catch {
    return null
  }
}

export const getProductReviews = async (id) => {
  try {
    return await request(`/product/${id}/reviews`)
  } catch {
    return null
  }
}

export const createProductReview = async (id, fields) => {
  try {
    return await authed(`/product/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(fields),
    })
  } catch {
    return null
  }
}

export const getWishlist = async () => {
  try {
    return await authed("/wishlist")
  } catch {
    return null
  }
}

export const saveWishlist = async (wishlistIds) => {
  try {
    return await authed("/wishlist", {
      method: "PUT",
      body: JSON.stringify({ wishlistIds }),
    })
  } catch {
    return null
  }
}

// GET /product/:id — a single product by its catalogue id.
// Resolves to the parsed response ({ success, product } / { success: false })
// or null when the backend is unreachable — callers use that to decide
// between "not found" (server answered) and the local fallback (no server).
export const getProduct = async (id) => {
  try {
    return await request(`/product/${id}`)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ orders */

export const getPaymentConfig = async () => {
  try {
    return await request("/payment/config")
  } catch {
    return null
  }
}

export const createCheckoutSession = async (payload) => {
  try {
    return await authed("/payment/checkout-session", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  } catch {
    return null
  }
}

// GET /order — admin: order list, optional ?status= / ?search= filters.
export const getOrders = async ({ status = "", search = "" } = {}) => {
  try {
    const query = new URLSearchParams()
    if (status) query.set("status", status)
    if (search) query.set("search", search)
    const qs = query.toString()
    return await authed(`/order${qs ? `?${qs}` : ""}`)
  } catch {
    return null
  }
}

// PATCH /order/:id/status — admin: move an order through the pipeline.
export const updateOrderStatus = async (id, status) => {
  try {
    return await authed(`/order/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  } catch {
    return null
  }
}

// POST /coupon/validate — checkout "Apply" button (server-priced discount).
export const validateCoupon = async (code, subtotal) => {
  try {
    return await request("/coupon/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    })
  } catch {
    return null
  }
}

/* ----------------------------------------------------------------- coupons */

export const getCoupons = async () => {
  try {
    return await authed("/coupon")
  } catch {
    return null
  }
}

export const createCoupon = async (fields) => {
  try {
    return await authed("/coupon", { method: "POST", body: JSON.stringify(fields) })
  } catch {
    return null
  }
}

export const updateCoupon = async (id, fields) => {
  try {
    return await authed(`/coupon/${id}`, { method: "PUT", body: JSON.stringify(fields) })
  } catch {
    return null
  }
}

export const deleteCoupon = async (id) => {
  try {
    return await authed(`/coupon/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

/* ------------------------------------------------------- users & dashboard */

// GET /dashboard/stats — admin: overview numbers for the dashboard home.
export const getStats = async () => {
  try {
    return await authed("/dashboard/stats")
  } catch {
    return null
  }
}

// GET /users — admin: account table.
export const getUsers = async () => {
  try {
    return await authed("/users")
  } catch {
    return null
  }
}

// PATCH /user/:id/role — admin: promote/demote.
export const updateUserRole = async (id, role) => {
  try {
    return await authed(`/user/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) })
  } catch {
    return null
  }
}

// DELETE /user/:id — admin: remove an account.
export const deleteUser = async (id) => {
  try {
    return await authed(`/user/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

/* ------------------------------------------------------------ newsletter */

// POST /subscribe — the newsletter box (public).
export const subscribe = async (email, source = "newsletter") => {
  try {
    return await request("/subscribe", { method: "POST", body: JSON.stringify({ email, source }) })
  } catch {
    return null
  }
}

// GET /subscriber — admin: subscriber list.
export const getSubscribers = async () => {
  try {
    return await authed("/subscriber")
  } catch {
    return null
  }
}

// DELETE /subscriber/:id — admin: remove a subscriber.
export const deleteSubscriber = async (id) => {
  try {
    return await authed(`/subscriber/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

export default {
  getCategories,
  getCategoryList,
  registerUser,
  verifyEmail,
  verifyResetCode,
  resendCode,
  loginUser,
  googleLoginUser,
  logoutUser,
  fetchCurrentUser,
  forgotPassword,
  setNewPassword,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductReviews,
  createProductReview,
  getProduct,
  getWishlist,
  saveWishlist,
  uploadProductImage,
  getPaymentConfig,
  createCheckoutSession,
  getOrders,
  updateOrderStatus,
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  subscribe,
  getSubscribers,
  deleteSubscriber,
}