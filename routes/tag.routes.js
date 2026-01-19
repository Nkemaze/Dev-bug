import express from "express";
import { getPopularTags } from "../controllers/tag.controller.js";

const router = express.Router();

// Popular tags
router.get("/popular", getPopularTags);

export default router;
