import express from "express";
import { getUserHistory } from "../controllers/historyController";
import { verifyJWT } from "../middleware/jwt-authentication";
const router = express.Router();

router.get("/data", verifyJWT, getUserHistory);
console.log("Testing 123");
export default router;
