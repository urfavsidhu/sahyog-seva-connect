import { Request, Response } from "express";
import { Cooperative } from "../models/Cooperative.model";
import { Member } from "../models/Member.model";

/** GET /api/coop — public list of approved cooperatives. */
export async function getCooperatives(req: Request, res: Response) {
  const coops = await Cooperative.find({ status: "approved" });
  res.status(200).json(coops);
}

/** GET /api/coop/me — the logged-in coop-admin's own cooperative. */
export async function getMyCooperative(req: Request, res: Response) {
  const coop = await Cooperative.findOne({ admin: req.user!.userId });
  if (!coop) {
    return res.status(404).json({ message: "Cooperative not found for this account" });
  }
  res.status(200).json(coop);
}

/** GET /api/coop/members — members of the logged-in coop-admin's cooperative. */
export async function getMembers(req: Request, res: Response) {
  const coop = await Cooperative.findOne({ admin: req.user!.userId });
  if (!coop) {
    return res.status(404).json({ message: "Cooperative not found for this account" });
  }
  const members = await Member.find({ cooperative: coop._id }).sort({ joined: -1 });
  res.status(200).json(members);
}

/**
 * POST /api/coop — admin approves a new cooperative record for a coop-role
 * user. Kept admin-only since coop status defaults to "pending" (see
 * Cooperative.model.ts) and should only go live after review.
 */
export async function createCooperative(req: Request, res: Response) {
  const { name, city, adminUserId } = req.body as { name: string; city: string; adminUserId: string };

  if (!name || !city || !adminUserId) {
    return res.status(400).json({ message: "name, city and adminUserId are required" });
  }

  const coop = await Cooperative.create({ name, city, admin: adminUserId, status: "pending" });
  res.status(201).json(coop);
}

/** PATCH /api/coop/:id/status — admin approves/rejects a cooperative. */
export async function updateCooperativeStatus(req: Request, res: Response) {
  const { status } = req.body as { status: "approved" | "pending" | "rejected" };

  if (!["approved", "pending", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const coop = await Cooperative.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!coop) {
    return res.status(404).json({ message: "Cooperative not found" });
  }

  res.status(200).json(coop);
}
