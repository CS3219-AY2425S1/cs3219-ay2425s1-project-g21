import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Text,
  Box,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";

interface DeleteAccountProps {
  userId?: string;
  onLogout: () => void;
}

export default function DeleteAccount({
  userId,
  onLogout,
}: DeleteAccountProps) {
  const [message, setMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure(); // For delete confirmation
  const {
    isOpen: isRedirectingOpen,
    onOpen: onRedirectingOpen,
    onClose: onRedirectingClose,
  } = useDisclosure(); // For redirecting modal
  const cancelRef = React.useRef(null);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      // Retrieve the JWT token
      const token = localStorage.getItem("token");

      const response = await fetch(`http://user-service/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "An error occurred");
      }

      const data = await response.json();
      setMessage(data.message || "Account deleted successfully.");

      // Show redirecting popup and wait before logging out and redirecting
      onRedirectingOpen();
      setTimeout(() => {
        localStorage.removeItem("token");
        onLogout();
        onRedirectingClose();
        navigate("/login");
      }, 3000); // Wait 3 seconds before logging out and redirecting
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <Box>
      <Text>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </Text>
      <Button colorScheme="red" onClick={onOpen}>
        Delete Account
      </Button>

      {/* Alert Dialog for Confirmation */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  handleDeleteAccount();
                  onClose(); // Close the confirmation dialog after confirming deletion
                }}
                ml={3}
              >
                Confirm Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Redirecting Modal */}
      <Modal isOpen={isRedirectingOpen} onClose={() => {}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Redirecting...</ModalHeader>
          <ModalBody display="flex" alignItems="center">
            <Spinner size="sm" mr={2} />
            <Text>Account deleted successfully. Redirecting to login...</Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Message Display */}
      {message && (
        <Box mt={4} p={3} bg="gray.100" borderRadius="md">
          <Text>{message}</Text>
        </Box>
      )}
    </Box>
  );
}
