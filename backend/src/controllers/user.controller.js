import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone || "",
  role: u.role,
  isVerified: u.isVerified,
  createdAt: u.createdAt,
});

// GET /users — admin: account list for the dashboard's Users table.
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, message: users.length ? "Users" : "No users found", users: users.map(publicUser) });
});

// PATCH /user/:id/role — admin: promote/demote staff.
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body || {};
  if (!["user", "admin"].includes(role)) throw new ApiError(400, "Invalid role");
  if (String(req.user.id) === String(req.params.id)) throw new ApiError(400, "You can't change your own role");

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();
  res.json({ success: true, message: `${user.name} is now ${role}`, user: publicUser(user) });
});

// DELETE /user/:id — admin: remove an account (never yourself).
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) throw new ApiError(400, "You can't delete your own account");

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "User deleted" });
});