import jwt from "jsonwebtoken";
import type { Role } from "../models/User.model";

interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",
  });
}

export type { TokenPayload };
