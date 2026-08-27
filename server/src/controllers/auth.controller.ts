import { Request, Response } from "express";
import { User, type Role } from "../models/User.model";
import { generateToken } from "../utils/generateToken";

/**
 * Signup — only ever creates "customer" or "worker" accounts.
 * "coop" is granted later by an admin (see user.controller.ts), and
 * "admin" is never stored on a user document at all — it's decided
 * dynamically at login time below, by matching ADMIN_EMAIL.
 */
export async function signup(req: Request, res: Response) {
  try {
    const { name, email, phone, city, password, role } = req.body as {
      name: string;
      email: string;
      phone: string;
      city?: string;
      password: string;
      role: Role;
    };

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone and password are required" });
    }

    const allowedSignupRoles: Role[] = ["customer", "worker"];
    const safeRole = allowedSignupRoles.includes(role) ? role : "customer";

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, phone, city, password, role: safeRole });

    const effectiveRole = resolveRole(user.email, user.role);
    const token = generateToken({ userId: user.id, email: user.email, role: effectiveRole });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
      },
    });
  } catch (error) {
    console.error("signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Core requirement: whoever logs in with ADMIN_EMAIL gets the admin
    // role for this session, regardless of what role is stored in the DB.
    // Everyone else gets exactly their stored role (customer/worker/coop).
    const effectiveRole = resolveRole(user.email, user.role);
    const token = generateToken({ userId: user.id, email: user.email, role: effectiveRole });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}

/** Decides the role a JWT is issued with — admin email always wins. */
function resolveRole(email: string, storedRole: Role): Role {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (adminEmail && email.toLowerCase() === adminEmail) {
    return "admin";
  }
  return storedRole;
}
