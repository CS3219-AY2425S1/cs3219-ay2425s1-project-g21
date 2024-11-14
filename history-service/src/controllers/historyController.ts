import { Request, Response } from "express";
import database from "../config/firebaseConfig";
import { ref, get, set, update } from "firebase/database";
import { HistoryModel, Topic} from "../models/history-model";

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

export const getUserHistoryByCategory = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;
        const cat = req.body.category;
        if (!userId || typeof userId !== "string") {
          return res.status(400).json({ message: "Invalid or missing userId." });
        }

        if (!cat || typeof cat !== "string") {
            return res.status(400).json({ message: "Invalid or missing category." });
        }

        const historyRef = ref(database, `history/${userId}`);
        const historySnapshot = await get(historyRef);

        if (!historySnapshot.exists()) {
            return res.status(404).json({ message: "History data not found." });
        }

        const historyData = historySnapshot.val();

        const result: HistoryModel[] = [];

        for (const roomId in historyData) {

            const room: HistoryModel = historyData[roomId];
            if (room.category.includes(cat as Topic)) {
                result.push(room);
            }
            
        }

        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ message: `No questions found in category '${cat}'.` });
        }

    } catch (error) {
        console.error("Error fetching history data by category:", error);
        return res.status(500).json({ message: "Failed to fetch history data by category." });
    }
}
