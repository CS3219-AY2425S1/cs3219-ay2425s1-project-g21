import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
} from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { ref, onValue } from "firebase/database"; // Import Firebase functions
import { FIREBASE_DB } from "../../FirebaseConfig"; // Adjust path to your Firebase config
import axios from "axios"; // Import axios for API requests

interface ChatComponentProps {
  userId: string;
  roomId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ userId, roomId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { author: string; message: string; time: string }[]
  >([]);
  const [otherUsername, setOtherUsername] = useState<string | null>(null); // State for the other user's username

  useEffect(() => {
    // Initialize the socket connection only after userId and roomId are set
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.emit("join_room", { roomId, userId });

    newSocket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, roomId]);

  useEffect(() => {
    // Reference to the users in the room
    const userRef = ref(FIREBASE_DB, `rooms/${roomId}/users`);

    // Listen to changes in the users list in the room
    const unsubscribe = onValue(userRef, async (snapshot) => {
      const users = snapshot.val();

      // Find the other user's ID by filtering out the current user's ID
      const otherUserId = Object.keys(users || {}).find((id) => id !== userId);

      if (otherUserId) {
        try {
          // Fetch the username using the /id-to-username/:id endpoint
          const response = await axios.get(
            `http://localhost:3001/users/id-to-username/${otherUserId}`
          );
          const username = response.data.username;

          // Update the state with the other user's username
          setOtherUsername(username);
        } catch (error) {
          console.error("Failed to fetch username:", error);
        }
      } else {
        setOtherUsername(null); // Clear the username if no other user is in the room
      }
    });

    return () => unsubscribe(); // Cleanup the listener when component unmounts
  }, [roomId, userId]);

  const sendMessage = () => {
    if (!socket || !userId || !roomId || !message.trim()) return; // Check if message is not empty or whitespace

    const messageData = {
      roomId,
      message: message.trim(), // Trim any extra whitespace
      author: userId,
      time: new Date().toISOString(),
    };
    socket.emit("send_message", messageData);
    setMessage("");
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md" maxW="md">
      <VStack spacing={4} align="stretch">
        {/* Display the other user's username if available */}
        {otherUsername && (
          <Text fontSize="lg" fontWeight="bold">
            Chatting with: {otherUsername}
          </Text>
        )}

        <Box
          bg="gray.50"
          p={4}
          borderRadius="md"
          overflowY="auto"
          height="600px"
          width="100%"
        >
          <ScrollableFeed>
            {messages.map((msg, index) => (
              <Flex
                key={index}
                mb={3}
                align="flex-end"
                justify={msg.author === userId ? "flex-end" : "flex-start"}
              >
                <Box
                  bg={msg.author === userId ? "#BEE3F8" : "#B9F5D0"}
                  color="black"
                  borderRadius="20px"
                  padding="0.5px 12px"
                  maxWidth="70%"
                  alignSelf={msg.author === userId ? "flex-end" : "flex-start"}
                  ml={msg.author === userId ? "auto" : undefined}
                  mr={msg.author === userId ? 2 : undefined}
                >
                  <Text lineHeight="1">{msg.message}</Text>
                </Box>
              </Flex>
            ))}
          </ScrollableFeed>
        </Box>
        <HStack>
          <Input
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} colorScheme="blue">
            Send
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ChatComponent;
