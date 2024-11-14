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
import { ref, onValue } from "firebase/database";
import { FIREBASE_DB } from "../../FirebaseConfig";
import axios from "axios";

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
  const [otherUsername, setOtherUsername] = useState<string | null>(null);

  useEffect(() => {
    // Load messages from local storage on initial render
    const storedMessages = localStorage.getItem(`chat_messages_${roomId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [roomId]);

  useEffect(() => {
    // Initialize the socket connection only after userId and roomId are set
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.emit("join_room", { roomId, userId });

    newSocket.on("receive_message", (data) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
        localStorage.setItem(
          `chat_messages_${roomId}`,
          JSON.stringify(updatedMessages)
        ); // Save to local storage
        return updatedMessages;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, roomId]);

  useEffect(() => {
    const userRef = ref(FIREBASE_DB, `rooms/${roomId}/users`);

    const unsubscribe = onValue(userRef, async (snapshot) => {
      const users = snapshot.val();
      const otherUserId = Object.keys(users || {}).find((id) => id !== userId);

      if (otherUserId) {
        try {
          const response = await axios.get(
            `http://localhost:3001/users/id-to-username/${otherUserId}`
          );
          setOtherUsername(response.data.username);
        } catch (error) {
          console.error("Failed to fetch username:", error);
        }
      } else {
        setOtherUsername(null);
      }
    });

    return () => unsubscribe();
  }, [roomId, userId]);

  const sendMessage = () => {
    console.log("sendMessage called"); // To check if it's called twice

    if (!socket || !userId || !roomId || !message.trim()) return;

    const messageData = {
      roomId,
      message: message.trim(),
      author: userId,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", messageData); // Send the message to the server

    setMessage(""); // Clear the input field
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md" maxW="md">
      <VStack spacing={4} align="stretch">
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
          height="450px"
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
