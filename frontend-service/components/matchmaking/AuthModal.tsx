import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onCancelAuth: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignIn, onCancelAuth }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Session Expired</ModalHeader>
        <ModalBody>
          Your session has expired or you are not authorized. Please sign in again or cancel to continue.
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSignIn}>
            Sign In
          </Button>
          <Button variant="ghost" onClick={onCancelAuth}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;