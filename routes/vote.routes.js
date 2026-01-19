import express from "express";
import { votePost, getVotes } from "../controllers/vote.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, votePost);
router.get("/:postType/:postId", getVotes);

export default router;
