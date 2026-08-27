import { Schema, model, Document, Types } from "mongoose";

export interface IWorker extends Document {
  user: Types.ObjectId;
  category: string;
  categoryId: string;
  rating: number;
  reviews: number;
  jobsCompleted: number;
  pricePerHour: number;
  experienceYears: number;
  cooperative?: Types.ObjectId;
  verified: boolean;
  skills: string[];
  bio: string;
  lat: number;
  lng: number;
  availableToday: boolean;
  status: "active" | "pending" | "suspended";
  documents: { name: string; status: "verified" | "pending" | "rejected" }[];
  earningsThisMonth: number;
}

const workerSchema = new Schema<IWorker>(
  {
    // One Worker profile per User account (role: "worker").
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    category: { type: String, required: true },
    categoryId: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    pricePerHour: { type: Number, required: true },
    experienceYears: { type: Number, default: 0 },
    cooperative: { type: Schema.Types.ObjectId, ref: "Cooperative" },
    verified: { type: Boolean, default: false },
    skills: [{ type: String }],
    bio: { type: String, default: "" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    availableToday: { type: Boolean, default: true },
    // "pending" until cooperative/admin verifies documents; only "active"
    // workers should surface in customer-facing search results.
    status: { type: String, enum: ["active", "pending", "suspended"], default: "pending" },
    documents: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ["verified", "pending", "rejected"], default: "pending" },
      },
    ],
    earningsThisMonth: { type: Number, default: 0 },
  },
  { timestamps: true },
);

workerSchema.index({ lat: 1, lng: 1 });

export const Worker = model<IWorker>("Worker", workerSchema);
