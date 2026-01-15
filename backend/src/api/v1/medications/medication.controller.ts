import { Request, Response } from "express";
import { getNextMedicationForUser } from "./medication.service";

export async function getNextMedication(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const next = await getNextMedicationForUser(userId);
    return res.json(next);

  } catch (error) {
    console.error("getNextMedication failed:", error);
    return res.status(500).json({ error: "Failed to fetch next medication" });
  }
}
