import { Schema, model, Document, Types } from "mongoose";

export interface ICooperative extends Document {
  name: string;
  city: string;
  admin: Types.ObjectId;
  members: number;
  jobs: number;
  revenue: number;
  status: "approved" | "pending" | "rejected";
}

const cooperativeSchema = new Schema<ICooperative>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true },
    // The User (role: "coop") who manages this cooperative's dashboard.
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: Number, default: 0 },
    jobs: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    // New cooperatives start "pending" until the platform admin approves
    // them — only "approved" coops should be visible/searchable publicly.
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
  },
  { timestamps: true },
);

export const Cooperative = model<ICooperative>("Cooperative", cooperativeSchema);
