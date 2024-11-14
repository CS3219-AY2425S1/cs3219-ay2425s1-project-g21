import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../../../components/collab/CodeEditor";
import OldCodeEditor from "../../../components/collab/OldCodeEditor";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { FIREBASE_DB } from "../../../FirebaseConfig";
import { ref, onValue } from "firebase/database";

interface OldRoomPageProps {
  userId: string;
}

const OldRoomPage: React.FC<OldRoomPageProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<"active" | "inactive">(
    "inactive"
  );

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

      // TODO: This to change to join old room
      const response = await fetch(
        `${
          import.meta.env.VITE_COLLABORATION_SERVICE_API_URL
        }/room/join/${roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to join room.");
      }
    } catch (err) {
      setError("Failed to join room.");
      console.error("Error joining room:", err);
    } finally {
      setLoading(false);
    }
  };

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
      {roomId && <OldCodeEditor roomId={roomId} thisUserId={userId} />}
    </Box>
  );
};

export default OldRoomPage;
