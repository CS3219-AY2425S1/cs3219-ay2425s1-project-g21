import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  userId: string;
  onPasswordUpdated: () => void;
}

const ChangePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  userId,
  onPasswordUpdated,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const handlePasswordUpdate = async () => {
    setError(""); // Clear previous errors

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://user-service/users/${userId}/force-change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword, confirmPassword }),
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Failed to update password");
      }

      toast({
        title: "Password updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onPasswordUpdated();
    } catch (error: any) {
      setError(error.message || "Failed to update password");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Password</ModalHeader>
        <ModalBody>
          <Text color="gray.600" mb={4}>
            You are seeing this prompt because you logged in with a temporary
            password. Please update your password to continue.
          </Text>
          <FormControl isRequired mb={4}>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          {error && (
            <Text color="red.500" mt={2}>
              {error}
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handlePasswordUpdate}>
            Update Password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
