import express from "express";
import { getUserHistory, getUserHistoryByCategory } from "../controllers/historyController";
import { verifyJWT } from "../middleware/jwt-authentication";
const router = express.Router();

router.get("/data", verifyJWT, getUserHistory);
router.post("/data/category", verifyJWT, getUserHistoryByCategory);

export default router;
