import { Router } from "express";
import { getProperties, createProperty } from "../controllers/propertyController.js";

const router = Router();

router.get("/", getProperties);
router.post("/", createProperty);

export default router;