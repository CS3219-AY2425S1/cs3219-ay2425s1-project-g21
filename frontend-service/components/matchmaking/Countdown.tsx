import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  Box,
  Spinner,
  Flex,
  Heading,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { fetchWithAuth } from "../../src/utils/fetchWithAuth";

interface CountdownProps {
  onSuccess: (roomId: string) => void; // Called when match found
  onFailure: () => void; // Called when no match found
  onCancel: () => void; // Called when user cancels matching
}

const Countdown: React.FC<CountdownProps> = ({
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0); // Start from 0 seconds
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch initial waiting time
  const fetchWaitingTime = async () => {
    try {
      const result = await fetchWithAuth("http://localhost:3002/waiting-time", { method: "GET" });
      if (result.waitingTime !== undefined) {
        setSeconds(result.waitingTime); // Set the starting point from the server
      } else {
        console.error("Failed to fetch waiting time");
      }
    } catch (error) {
      // setSeconds(0);
      console.error("Error fetching waiting time:", error);
    }
  };

  // Call the waiting-time endpoint on component mount
  useEffect(() => {
    fetchWaitingTime();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetchWithAuth("http://localhost:3002/match-status");
        if (response.matchStatus === "isMatched") {
          clearInterval(intervalRef.current!);
          onSuccess(response.roomId); // Pass the roomId if match found
        } else if (response.matchStatus === "unsuccessful") {
          clearInterval(intervalRef.current!);
          onFailure();
        }
      } catch (error) {
        console.error("Failed to check match status:", error);
      }
    }, 2000);

    return () => clearInterval(intervalRef.current!);
  }, [onSuccess, onFailure]);

  // Count-up effect
  useEffect(() => {
    const timerId = setTimeout(() => setSeconds(seconds + 1), 1000);
    return () => clearTimeout(timerId);
  }, [seconds]);

  const handleCancel = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsDialogOpen(false);
    clearInterval(intervalRef.current!);
    onCancel();
  };

  return (
    <Box textAlign="center" mt={10}>
      <Flex align="center" flexDirection="column">
        <Heading mb={4}>Finding you a peer...</Heading>
        <Spinner size="xl" mb={4} />
        <Text fontSize="2xl">{seconds} seconds passed</Text>

        <Button
          colorScheme="red"
          mt={6}
          onClick={handleCancel}
          disabled={isCheckingMatch}
        >
          Cancel Matching
        </Button>

        {/* Confirmation Dialog */}
        <AlertDialog
          isOpen={isDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Cancel Matching
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to cancel the matching process?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                  No
                </Button>
                <Button colorScheme="red" onClick={handleConfirmCancel} ml={3}>
                  Yes, Cancel
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    </Box>
  );
};

export default Countdown;
