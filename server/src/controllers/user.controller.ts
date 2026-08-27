import { Request, Response } from "express";
import { User } from "../models/User.model";

/** GET /api/users/me — logged-in user's own profile (any role). */
export async function getCurrentUser(req: Request, res: Response) {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: req.user!.role, // effective role (handles the admin-email override)
    status: user.status,
    joined: user.joined,
  });
}

/** PATCH /api/users/me — user edits their own name/phone/city. */
export async function updateProfile(req: Request, res: Response) {
  const { name, phone, city } = req.body as { name?: string; phone?: string; city?: string };

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { ...(name && { name }), ...(phone && { phone }), ...(city && { city }) },
    { new: true, runValidators: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: req.user!.role,
  });
}

/** GET /api/users — admin only: full user directory. */
export async function getUsers(req: Request, res: Response) {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(users);
}

/** PATCH /api/users/:id/status — admin suspends/reactivates an account. */
export async function updateUserStatus(req: Request, res: Response) {
  const { status } = req.body as { status: "active" | "suspended" };

  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
}

/**
 * PATCH /api/users/:id/role — admin promotes a user to "coop", or corrects
 * a role. Never accepts "admin" here — admin access is only ever granted
 * via ADMIN_EMAIL at login time (see auth.controller.ts).
 */
export async function updateUserRole(req: Request, res: Response) {
  const { role } = req.body as { role: string };

  if (!["customer", "worker", "coop"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
}
