import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

// GET logged-in user
router.get("/me", verifyToken, getCurrentUser);

export default router;
