import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

export interface IBooking extends Document {
  worker: Types.ObjectId;
  workerName: string;
  workerPhoto: string;
  customer: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  slot: string;
  status: BookingStatus;
  price: number;
  address: string;
  urgent: boolean;
  otp: string;
  payment: "online" | "cash";
  lat: number;
  lng: number;
  rated: boolean;
}

const bookingSchema = new Schema<IBooking>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    // Denormalized name/photo snapshot at booking time so history stays
    // readable even if the worker later edits their profile.
    workerName: { type: String, required: true },
    workerPhoto: { type: String, default: "" },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    price: { type: Number, required: true },
    address: { type: String, required: true },
    urgent: { type: Boolean, default: false },
    // 4-digit code the customer shares with the worker on job completion.
    otp: { type: String, required: true },
    payment: { type: String, enum: ["online", "cash"], default: "cash" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    rated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookingSchema.index({ customer: 1 });
bookingSchema.index({ worker: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
