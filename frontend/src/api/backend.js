// Lightweight client for the Express backend in /backend.
// Uses the same env pattern as the reference project: VITE_AUTH_URL.
// Falls back to the local dev server (server.js default port 8000).
const BASE_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/v1"

const request = async (path, options = {}) => {
  const { headers, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  })
  return res.json()
}

// GET /category — returns the list of category names (strings).
// Resolves to [] when the backend is unreachable or the DB has none.
export const getCategories = async () => {
  try {
    const data = await request("/category")
    if (data?.success && Array.isArray(data.category)) {
      return data.category.map((c) => c.categoryName).filter(Boolean)
    }
    return []
  } catch {
    return []
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

// POST /register — saves the account in MongoDB via the backend.
// Resolves to the parsed response; never throws (callers treat it as best-effort).
export const registerUser = async ({ name, email, password }) => {
  try {
    return await request("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  } catch {
    return null
  }
}

// POST /verify/:token — confirms the email verification link from the backend email.
export const verifyEmail = async (token) => {
  try {
    return await request(`/verify/${token}`, { method: "POST" })
  } catch {
    return null
  }
}

// POST /forgot-password — asks the backend to email a reset link.
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

// POST /setnew-password/:token — saves the new password after the reset link.
export const setNewPassword = async (token, newPassword, confirmPassword) => {
  try {
    return await request(`/setnew-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ newPassword, confirmPassword }),
    })
  } catch {
    return null
  }
}

// POST /category — creates a category in MongoDB.
export const createCategory = async (categoryName) => {
  try {
    return await request("/category", {
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
    return await request(`/category/${id}`, {
      method: "PUT",
      body: JSON.stringify({ categoryName }),
    })
  } catch {
    return null
  }
}

// DELETE /category/:id — removes a category from MongoDB.
export const deleteCategory = async (id) => {
  try {
    return await request(`/category/${id}`, { method: "DELETE" })
  } catch {
    return null
  }
}

// POST /product/create — creates a product (requires an admin JWT in the Authorization header).
export const createProduct = async ({ title, token }) => {
  try {
    return await request("/product/create", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: token ? { Authorization: token } : {},
    })
  } catch {
    return null
  }
}

export default { getCategories, getCategoryList, registerUser, verifyEmail, forgotPassword, setNewPassword, createCategory, updateCategory, deleteCategory, createProduct }
