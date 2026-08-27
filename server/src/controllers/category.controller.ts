import { Request, Response } from "express";
import { ServiceCategory } from "../models/ServiceCategory.model";

/** GET /api/categories — public, used by the home page service grid. */
export async function getCategories(req: Request, res: Response) {
  const categories = await ServiceCategory.find({ active: true });
  res.status(200).json(categories);
}

/** POST /api/categories — admin only: add a new service category. */
export async function createCategory(req: Request, res: Response) {
  const { id, name, nameHi, icon, basePrice } = req.body as {
    id: string;
    name: string;
    nameHi: string;
    icon: string;
    basePrice: number;
  };

  if (!id || !name || !nameHi || !icon || basePrice === undefined) {
    return res.status(400).json({ message: "id, name, nameHi, icon and basePrice are required" });
  }

  const existing = await ServiceCategory.findOne({ id });
  if (existing) {
    return res.status(409).json({ message: "A category with this id already exists" });
  }

  const category = await ServiceCategory.create({ id, name, nameHi, icon, basePrice });
  res.status(201).json(category);
}

/** PATCH /api/categories/:id — admin only: edit or activate/deactivate a category. */
export async function updateCategory(req: Request, res: Response) {
  const category = await ServiceCategory.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json(category);
}
