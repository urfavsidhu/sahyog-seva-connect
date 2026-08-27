import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  booking: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: "customer" | "worker";
  text: string;
}

const messageSchema = new Schema<IMessage>(
  {
    // Chat is scoped to a booking (customer <-> assigned worker), not a
    // standalone inbox — matches getMessages() being called per active job.
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["customer", "worker"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

messageSchema.index({ booking: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
