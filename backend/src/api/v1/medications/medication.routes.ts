import { Router } from "express";
import { getNextMedication } from "./medication.controller";

const router = Router();

router.get("/next/:userId", getNextMedication);

export default router;
