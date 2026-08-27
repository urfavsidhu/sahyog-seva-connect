import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  booking: Types.ObjectId;
  cooperative?: Types.ObjectId;
  member: string;
  service: string;
  amount: number;
  workerShare: number;
  coopShare: number;
  method: "online" | "cash";
  date: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    cooperative: { type: Schema.Types.ObjectId, ref: "Cooperative" },
    // Denormalized worker/member display name for quick listing.
    member: { type: String, required: true },
    service: { type: String, required: true },
    amount: { type: Number, required: true },
    // amount = workerShare + coopShare, split at booking-completion time.
    workerShare: { type: Number, required: true },
    coopShare: { type: Number, required: true },
    method: { type: String, enum: ["online", "cash"], default: "cash" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

transactionSchema.index({ cooperative: 1, date: -1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
