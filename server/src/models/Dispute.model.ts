import { Schema, model, Document, Types } from "mongoose";

export interface IDispute extends Document {
  booking: Types.ObjectId;
  raisedBy: Types.ObjectId;
  raisedByName: string;
  against: string;
  issue: string;
  status: "open" | "investigating" | "resolved";
  date: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    raisedByName: { type: String, required: true },
    // Name of the other party (worker or customer) the complaint is against.
    against: { type: String, required: true },
    issue: { type: String, required: true },
    // Only the platform admin (dispute.controller.ts) should move this
    // between "open" -> "investigating" -> "resolved".
    status: { type: String, enum: ["open", "investigating", "resolved"], default: "open" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

disputeSchema.index({ status: 1 });

export const Dispute = model<IDispute>("Dispute", disputeSchema);
