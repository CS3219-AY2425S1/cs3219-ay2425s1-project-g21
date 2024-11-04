import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import database from "../config/firebaseConfig";
import { ref, get, set, update } from "firebase/database";
import { Room } from "../models/room-model";

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

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.body;

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

    const newRoom: Room = {
      roomId: roomId,
      code: "// Enter your code here:",
      users: {
        [userId1]: false,
        [userId2]: false,
      },
      createdAt: Date.now(),
      selectedQuestionId: 0, // default number when not selected yet
      status: "active",
      currentLanguage: "javascript",
    };

    await set(roomRef, newRoom);

    const userRoomsRef1 = ref(database, `userRooms/${userId1}`);
    await set(userRoomsRef1, roomId);

    const userRoomsRef2 = ref(database, `userRooms/${userId2}`);
    await set(userRoomsRef2, roomId);

    res.status(201).json({ message: "Room created successfully", roomId });
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

    res.status(200).json(roomSnapshot.val());
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

    /*
    const updatedUsers = { ...roomData.users };
    delete updatedUsers[userId]; // remove curr user

    // update room users or set room status to inactive
    if (Object.keys(updatedUsers).length === 0) {
      await update(roomRef, { users: updatedUsers, status: "inactive" });
    } else {
      await update(roomRef, { users: updatedUsers });
    }
      */

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

    res.status(200).json({ message: "User has left the room", roomId });
  } catch (error) {
    console.error("Error in leaveRoom function:", error);
    res.status(500).json({ message: "Failed to leave room" });
  }
};
