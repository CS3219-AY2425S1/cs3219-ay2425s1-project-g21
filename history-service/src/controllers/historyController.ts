import { Request, Response } from "express";
import database from "../config/firebaseConfig";
import { ref, get, set, update } from "firebase/database";
import { HistoryModel } from "../models/history-model";

export const getUserHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;
        if (!userId || typeof userId !== "string") {
          return res.status(400).json({ message: "Invalid or missing userId." });
        }
    
        const historyRef = ref(database, `history/${userId}`);
        const historySnapshot = await get(historyRef);

        if (!historySnapshot.exists()) {
            return res.status(404).json({ message: "History data not found." });
        }

        return res.status(200).json(historySnapshot.val());
    } catch (error) {
        console.error("Error fetching history data:", error);
        return res.status(500).json({ message: "Failed to fetch history data" });
    }
}
