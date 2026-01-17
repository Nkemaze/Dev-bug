import express from "express";
import {
  createAnswer,
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
} from "../controllers/answer.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:questionId", verifyToken, createAnswer);
router.get("/:questionId", getAnswersByQuestion);

router.put("/edit/:id", verifyToken, updateAnswer);
router.delete("/delete/:id", verifyToken, deleteAnswer);
router.put("/accept/:id", verifyToken, acceptAnswer);

export default router;
