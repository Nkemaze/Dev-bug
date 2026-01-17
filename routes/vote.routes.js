import express from "express";
import { votePost } from "../controllers/vote.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, votePost);

export default router;
