import { Schema, model, Document } from "mongoose";

export interface IServiceCategory extends Document {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  basePrice: number;
  jobs: number;
  active: boolean;
}

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    // Slug-style id (e.g. "plumber") used by the frontend as categoryId —
    // kept separate from Mongo's _id so existing mock-data ids still work.
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameHi: { type: String, required: true },
    icon: { type: String, required: true },
    basePrice: { type: Number, required: true },
    jobs: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ServiceCategory = model<IServiceCategory>("ServiceCategory", serviceCategorySchema);
