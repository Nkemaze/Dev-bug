import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyCode,
  changePassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/change-password", changePassword);

export default router;
