import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../../../components/collab/CodeEditor";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { FIREBASE_DB } from "../../../FirebaseConfig";
import { ref, onValue } from "firebase/database";

interface RoomPageProps {
  userId: string;
  setUserActivity: React.Dispatch<React.SetStateAction<"room" | "matching" | null>>;
}

const RoomPage: React.FC<RoomPageProps> = ({ userId, setUserActivity }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<"active" | "inactive">(
    "inactive"
  );

  useEffect(() => {
    setUserActivity("room");
    return () => {
      setUserActivity(null);
    }
  }, [setUserActivity]);

  // Function to handle joining the room
  const joinRoom = async () => {
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found. Redirecting to login.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_COLLABORATION_SERVICE_API_URL}/room/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRoomId(data.roomId);
      } else {
        setError(data.message || "Failed to join room.");
      }
    } catch (err) {
      setError("Failed to join room.");
      console.error("Error joining room:", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for changes in the room's status in Firebase
  useEffect(() => {
    if (roomId) {
      const statusRef = ref(FIREBASE_DB, `rooms/${roomId}/status`);

      const unsubscribe = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        setRoomStatus(status === "active" ? "active" : "inactive");
      });

      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);

  useEffect(() => {
    // Automatically try to join room when component mounts
    if (userId) {
      joinRoom();
    }
  }, [userId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
        <Text ml={4}>Attempting to join room...</Text>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      {/* Display the room ID and active status at the top */}
      {roomId && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          You are in Room ID: <strong>{roomId}</strong> - Status:{" "}
          <strong>{roomStatus.toUpperCase()}</strong>
        </Text>
      )}

      {/* Display error message if any */}
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      {/* Display the Code Editor if joined successfully */}
      {roomId && <CodeEditor roomId={roomId} thisUserId={userId} />}
    </Box>
  );
};

export default RoomPage;
