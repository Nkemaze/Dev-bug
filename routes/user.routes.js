import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import { getCurrentUser, getAllUsers, getUserById, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

// GET logged-in user
router.get("/me", verifyToken, getCurrentUser);
router.get("/top", getAllUsers);
router.get("/:id", verifyToken, getUserProfile);

export default router;
