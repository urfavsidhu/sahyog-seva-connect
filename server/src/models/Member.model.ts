import { Schema, model, Document, Types } from "mongoose";

export interface IMember extends Document {
  cooperative: Types.ObjectId;
  worker: Types.ObjectId;
  name: string;
  photo: string;
  role: string;
  jobs: number;
  rating: number;
  earnings: number;
  share: number;
  joined: Date;
  status: "active" | "on-leave";
}

const memberSchema = new Schema<IMember>(
  {
    cooperative: { type: Schema.Types.ObjectId, ref: "Cooperative", required: true },
    // Links back to the Worker profile so coop.controller.ts can pull live
    // jobs/rating/earnings instead of duplicating them here long-term.
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    role: { type: String, default: "Member" },
    jobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    // Percentage share of coop revenue this member is entitled to.
    share: { type: Number, default: 0 },
    joined: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "on-leave"], default: "active" },
  },
  { timestamps: true },
);

memberSchema.index({ cooperative: 1 });

export const Member = model<IMember>("Member", memberSchema);
