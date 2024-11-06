import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../../components/collab/CodeEditor";
import { Box, Button, Spinner, Text } from "@chakra-ui/react";

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

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

      const response = await fetch("http://collaboration-service/room/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
      {/* Display the room ID at the top */}
      {roomId && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          You are in Room ID: <strong>{roomId}</strong>
        </Text>
      )}

      {/* Display error message if any */}
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      {/* Display the Code Editor if joined successfully */}
      {roomId && <CodeEditor roomId={roomId} />}
    </Box>
  );
};

export default RoomPage;
