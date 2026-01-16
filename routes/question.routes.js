import express from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createQuestion);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.put("/:id", verifyToken, updateQuestion);
router.delete("/:id", verifyToken, deleteQuestion);


export default router;
