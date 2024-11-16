import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import database from "../config/firebaseConfig";
import { ref, get, set, update } from "firebase/database";
import { Room } from "../models/room-model";
import { HistoryModel } from "../models/history-model";

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid or missing userId." });
    }

    const userRoomRef = ref(database, `userRooms/${userId}`);
    const userRoomSnapshot = await get(userRoomRef);

    if (!userRoomSnapshot.exists()) {
      return res.status(404).json({ message: "User is not in a room." });
    }

    const roomId = userRoomSnapshot.val() as string;

    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      return res.status(404).json({ message: "Room does not exist." });
    }

    const roomData = roomSnapshot.val() as Room;

    if (roomData.status !== "active") {
      return res.status(403).json({ message: "Room is not active." });
    }

    // authentication checks without jwt, can remove after implementing jwt
    if (!(userId in roomData.users)) {
      return res
        .status(403)
        .json({ message: "User is not allowed to join this room." });
    }

    const updatedUsers = {
      ...roomData.users,
      [userId]: true,
    };

    await update(roomRef, { users: updatedUsers });

    return res
      .status(200)
      .json({ message: "Joined room successfully.", roomId });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ message: "Failed to join room." });
  }
};

export const joinOldRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const roomId = req.params.roomId;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid or missing userId." });
    }

    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      return res.status(404).json({ message: "Room does not exist." });
    }

    // const roomData = roomSnapshot.val() as Room;

    // const updatedUsers = {
    //   ...roomData.users,
    //   [userId]: true,
    // };

    // await update(roomRef, { users: updatedUsers });

    return res
      .status(200)
      .json({ message: "Joined room successfully.", roomId });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ message: "Failed to join room." });
  }
};

// helper function for create room
function formatTime(unixTime: number): string {
  const date = new Date(unixTime);

  const dd = date.getDate().toString().padStart(2, "0");
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = date.getFullYear().toString();

  const hh = date.getHours().toString().padStart(2, "0");
  const mmin = date.getMinutes().toString().padStart(2, "0");
  const ss = date.getSeconds().toString().padStart(2, "0");

  const res = `${mm}-${dd}-${yyyy}, ${hh}:${mmin}:${ss} UTC`;
  return res;
}

// helper function for leave room
function formatHistoryTime(msTime: number): string {
  const total = Math.floor(msTime / 1000); // total number of seconds
  const sec = total % 60;
  const min = ((total - sec) % 3600) / 60;
  const hr = (total - sec - min * 60) / 3600;

  const hhh = hr.toString().padStart(3, "0");
  const mm = min.toString().padStart(2, "0");
  const ss = sec.toString().padStart(2, "0");

  return `${hhh}h ${mm}m ${ss}s`;
}

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { userId1, difficulty1, userId2, difficulty2, topic } = req.body;
    console.log(
      "Requesting questions from:",
      `${process.env.QUESTION_SERVICE_URI}/api/questions/filter?category=${topic}&difficulty=${difficulty1}&difficulty=${difficulty2}`
    );

    const questionsByCategory = await fetch(
      `${process.env.QUESTION_SERVICE_URI}/api/questions/filter?category=${topic}&difficulty=${difficulty1}&difficulty=${difficulty2}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Questions by category:", questionsByCategory);
    // TODO: Question pool should match difficulty
    const questions = await questionsByCategory.json();

    if (questions.length === 0) {
      res.status(404).json({
        message: "Cannot find questions on the topic selected.",
      });
    }

    // "random" algorithm to get a random question from the list of questions
    const randQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    const selectedId = randQuestion.questionId;
    console.log(selectedId);
    const roomId = uuidv4();

    const roomRef = ref(database, `rooms/${roomId}`);

    // checking if by chance a roomId that already exists is generated
    const roomSnapshot = await get(roomRef);
    if (roomSnapshot.exists()) {
      res.status(400).json({ message: "Room already exists" });
    }

    if (userId1 === userId2) {
      res
        .status(400)
        .json({ message: "Cannot create room with 2 same User ID." });
    }

    const currTime = formatTime(Date.now());
    const newRoom: Room = {
      roomId: roomId,
      code: {
        javascript: "// Start writing your JavaScript code here...",
        python: "# Start writing your Python code here...",
        java: "// Start writing your Java code here...",
        csharp: "// Start writing your C# code here...",
      },
      users: {
        [userId1]: false,
        [userId2]: false,
      },
      createdAt: currTime,
      selectedQuestionId: selectedId,
      status: "active",
      userLanguages: {
        [userId1]: "javascript",
        [userId2]: "javascript",
      },
      questionDetails: {
        title: randQuestion.title,
        description: randQuestion.description,
        category: randQuestion.category,
        difficulty: randQuestion.difficulty,
      }
    };

    await set(roomRef, newRoom);

    const userRoomsRef1 = ref(database, `userRooms/${userId1}`);
    await set(userRoomsRef1, roomId);

    const userRoomsRef2 = ref(database, `userRooms/${userId2}`);
    await set(userRoomsRef2, roomId);

    const newHistory: HistoryModel = {
      roomId: roomId,
      selectedQuestionId: selectedId,
      questionTitle: randQuestion.title,
      category: randQuestion.category,
      difficulty: randQuestion.difficulty,
      attemptDateTime: currTime,
      attemptTimeTaken: "", // empty string means session has not ended
      attemptTimeStart: Date.now(),
    };

    const historyRef1 = ref(database, `history/${userId1}/${roomId}`);
    await set(historyRef1, newHistory);

    const historyRef2 = ref(database, `history/${userId2}/${roomId}`);
    await set(historyRef2, newHistory);

    // include randomized question id in create room function
    res.status(201).json({
      message: "Room created successfully",
      roomId,
      selectedQuestionId: selectedId,
    });
    console.log(
      `Room ID ${roomId} created for users ${userId1} and ${userId2}`
    );
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Failed to create room" });
  }
};

// function to retrieve room data based on user's current active room
export const getRoomData = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "Invalid userId." });
    }

    const userRoomRef = ref(database, `userRooms/${userId}`);
    const userRoomSnapshot = await get(userRoomRef);

    if (!userRoomSnapshot.exists()) {
      res.status(404).json({ message: "User is not in a room." });
    }
    const id = userRoomSnapshot.val() as string;

    const roomRef = ref(database, `rooms/${id}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      res.status(404).json({ message: "Room not found" });
    }

    const roomData = roomSnapshot.val();
    const selectedQuestionId = roomData.selectedQuestionId;
    const createdAt = roomData.createdAt;

    return res.status(200).json({ roomData, selectedQuestionId, createdAt });
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({ message: "Failed to fetch room data" });
  }
};

export const getOldRoomData = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const roomId = req.params.roomId;

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "Invalid userId." });
    }

    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      res.status(404).json({ message: "Room not found" });
    }

    const roomData = roomSnapshot.val();
    const selectedQuestionId = roomData.selectedQuestionId;

    return res.status(200).json({ roomData, selectedQuestionId });
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({ message: "Failed to fetch room data" });
  }
};

// not in use for now
export const setRoomInactive = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;

    if (!roomId || typeof roomId !== "string") {
      res.status(400).json({ message: "Invalid roomId." });
    }

    const roomRef = ref(database, `rooms/${roomId}`);

    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
      res.status(404).json({ message: "Room does not exist." });
    }

    const roomData = roomSnapshot.val() as Room;

    if (roomData.status === "inactive") {
      res.status(400).json({ message: "Room is already inactive." });
    }

    await update(roomRef, { status: "inactive" });

    res.status(200).json({ message: "Room has been set to inactive.", roomId });
  } catch (error) {
    console.error("Error setting room to inactive:", error);
    res.status(500).json({ message: "Failed to set room status." });
  }
};

// function to get roomId associated with the current user
export const getRoomId = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "Invalid userId." });
    }

    const userRoomRef = ref(database, `userRooms/${userId}`);
    const userRoomSnapshot = await get(userRoomRef);

    if (!userRoomSnapshot.exists()) {
      res.status(404).json({ message: "User is not in a room." });
    }

    const roomId = userRoomSnapshot.val() as string;
    res.status(200).json({ roomId });
  } catch (error) {
    console.error("Error fetching current room id:", error);
    res.status(500).json({ message: "Failed to fetch the current room." });
  }
};

// function for users to leave room
export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const userRoomRef = ref(database, `userRooms/${userId}`);
    const userRoomSnapshot = await get(userRoomRef);
    console.log("UserRoom Reference Path:", userRoomRef.toString());
    console.log("UserRoom Snapshot Exists:", userRoomSnapshot.exists());
    console.log("UserRoom Snapshot Data:", userRoomSnapshot.val());

    if (!userRoomSnapshot.exists()) {
      return res.status(404).json({ message: "User is not in a room" });
    }

    // get room data
    const roomId = userRoomSnapshot.val() as string;
    const roomRef = ref(database, `rooms/${roomId}`);
    console.log("User ID:", userId);
    console.log("Room ID retrieved from userRooms:", roomId);
    console.log("Room Reference Path:", roomRef.toString());
    const roomSnapshot = await get(roomRef);
    console.log("Room Snapshot Exists:", roomSnapshot.exists());
    console.log("Room Snapshot Data:", roomSnapshot.val());

    if (!roomSnapshot.exists()) {
      return res.status(404).json({ message: "Room does not exist" });
    }

    const roomData = roomSnapshot.val() as Room;

    // check if user is in room's list
    if (!(userId in roomData.users)) {
      return res
        .status(403)
        .json({ message: "User is not a member of this room" });
    }

    const updatedUsers = { ...roomData.users, [userId]: false };
    await update(roomRef, { users: updatedUsers });

    const allInactive = Object.values(updatedUsers).every(
      (status) => status === false
    );

    if (allInactive) {
      await update(roomRef, { status: "inactive" });
    }

    await set(userRoomRef, null);
    console.log(`User ${userId} has been removed from userRooms`);

    // check that userId in userRooms is removed
    const postRemovalSnapshot = await get(userRoomRef);
    if (!postRemovalSnapshot.exists()) {
      console.log(`Verified: userRooms entry for ${userId} has been cleared.`);
    } else {
      console.warn(`Warning: userRooms entry for ${userId} still exists.`);
    }

    const historyRef = ref(database, `history/${userId}/${roomId}`);
    const historyData = (await get(historyRef)).val() as HistoryModel;
    const historyTime = formatHistoryTime(
      Date.now() - historyData.attemptTimeStart
    );
    await update(historyRef, { attemptTimeTaken: historyTime });

    res.status(200).json({ message: "User has left the room", roomId });
  } catch (error) {
    console.error("Error in leaveRoom function:", error);
    res.status(500).json({ message: "Failed to leave room" });
  }
};
