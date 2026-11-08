export const PASSWORD_ERROR =
  "Use at least 8 characters. Passwords may be up to 72 bytes."

export const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  new TextEncoder().encode(password).length <= 72
