import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  booking: Types.ObjectId;
  worker: Types.ObjectId;
  author: Types.ObjectId;
  authorName: string;
  rating: number;
  comment: string;
  service: string;
}

const reviewSchema = new Schema<IReview>(
  {
    // One review per booking — enforced by the unique index below, and
    // submitReview in review.controller.ts should also set booking.rated.
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    service: { type: String, required: true },
  },
  { timestamps: true },
);

reviewSchema.index({ worker: 1 });

export const Review = model<IReview>("Review", reviewSchema);
