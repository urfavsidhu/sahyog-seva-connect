import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "customer" | "worker" | "coop" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  role: Role;
  status: "active" | "suspended";
  joined: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    city: { type: String, trim: true },
    // Signup only ever sets "customer" or "worker" — see auth.controller.ts.
    // "coop" is granted later by an admin; "admin" is never stored here and
    // is decided at login time by matching ADMIN_EMAIL (see auth.controller.ts).
    role: { type: String, enum: ["customer", "worker", "coop", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    joined: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
